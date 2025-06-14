import {
  DicebearTypes,
  generateRandomURLAvatar
} from '@/infra/helpers/dicebear'
import { generateUUID } from '@/infra/helpers/generate'
import { and, eq, not } from 'drizzle-orm'
import { db } from '..'
import { makePasswordHasher } from '../../cryptography/password'
import { slug } from '../../helpers/string'
import { logger } from '../../lib/logger/logger-server'
import {
  member,
  organization,
  userToCategory,
  verification
} from '../schemas/auth'
import { account } from '../schemas/auth/account'
import { user } from '../schemas/auth/user'
import { post, tag } from '../schemas/blog'
import { category } from '../schemas/blog/category'
import { subcategory } from '../schemas/blog/subcategory'
import postsData from './assets/posts.json'
import users from './assets/users.json'

async function seed() {
  try {
    logger.info('Start seed DB...')
    await db.transaction(async (tx) => {
      logger.info('Cleaning DB...')
      await tx.delete(organization)
      await tx.delete(userToCategory)
      await tx.delete(post)
      await tx.delete(tag)
      await tx.delete(category)
      await tx.delete(subcategory)
      await tx.delete(user)
      await tx.delete(member)
      await tx.delete(account)
      await tx.delete(verification)
      logger.info('DB cleaned!')

      logger.info('Seed - Create Org!')
      const name = 'Doblog'
      const [orgData] = await tx
        .insert(organization)
        .values({
          name,
          slug: slug(name),
          logo: generateRandomURLAvatar(),
          description: 'Create your blog with Doblog',
          keywords:
            'create a blog; self-hosting blog; edit my blog; nextjs blog;greens group; grn; '
        })
        .returning()
      logger.info('Seed - Org created!')

      logger.info('Seed - Create users!')
      logger.info('Seed - Creating anonymous!')
      const [createdAnonymousUser] = await tx
        .insert(user)
        .values({
          name: 'Anonymous',
          email: 'anonymous',
          emailVerified: true,
          role: 'editor',
          image: generateRandomURLAvatar()
        })
        .returning()

      await tx.insert(account).values({
        accountId: generateUUID(),
        userId: createdAnonymousUser!.id,
        providerId: 'credential',
        password: await makePasswordHasher().hash(generateUUID())
      })

      await tx.insert(member).values({
        organizationId: orgData.id,
        userId: createdAnonymousUser.id,
        role: 'editor'
      })

      logger.info('Seed - Creating admin!')
      const [newUser] = await tx
        .insert(user)
        .values({
          name: users.admin.name,
          email: users.admin.email,
          emailVerified: true,
          role: 'admin',
          image: generateRandomURLAvatar({
            type: DicebearTypes.notionists
          }),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning()

      await tx
        .insert(account)
        .values({
          accountId: crypto.randomUUID(),
          userId: newUser!.id,
          providerId: 'credential',
          password: await makePasswordHasher().hash(users.admin.password),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning()

      await tx
        .insert(member)
        .values({
          organizationId: orgData.id,
          userId: newUser.id,
          role: 'admin'
        })
        .returning()
      logger.info('Seed - Admin created!')

      logger.info('Seed - Creating editor!')
      const [newEditorUser] = await tx
        .insert(user)
        .values({
          name: users.editor.name,
          email: users.editor.email,
          emailVerified: true,
          role: 'editor',
          image: generateRandomURLAvatar({ type: DicebearTypes.notionists }),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning()

      await tx
        .insert(account)
        .values({
          accountId: crypto.randomUUID(),
          userId: newEditorUser!.id,
          providerId: 'credential',
          password: await makePasswordHasher().hash(users.editor.password),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning()

      await tx
        .insert(member)
        .values({
          organizationId: orgData.id,
          userId: newEditorUser.id,
          role: 'editor'
        })
        .returning()
      logger.info('Seed - Editor created!')

      // Seed categories and subcategories
      const categoriesData = [
        {
          name: 'Marketing',
          slug: 'marketing',
          description: 'Conteúdo sobre marketing digital'
        },
        {
          name: 'Comercial',
          slug: 'comercial',
          description: 'Estratégias e dicas de vendas'
        },
        {
          name: 'Técnico',
          slug: 'tecnico',
          description: 'Informações técnicas sobre nossos produtos'
        },
        {
          name: 'Mercado',
          slug: 'mercado',
          description: 'Análises e tendências de mercado'
        }
      ]

      const categories = await tx
        .insert(category)
        .values(categoriesData)
        .returning()

      const subcategoriesMap = {
        Marketing: [
          'Geração de Leads',
          'SEO e Conteúdo',
          'Marketing de Relacionamento',
          'Métricas e Análise',
          'Branding e Posicionamento'
        ],
        Comercial: [
          'Estratégias de Vendas',
          'Sucesso do Cliente',
          'Upselling e Cross-selling',
          'Gestão de Funil de Vendas',
          'Casos de Sucesso'
        ],
        Técnico: [
          'Guias e Tutoriais',
          'Integrações e APIs',
          'Segurança e Conformidade',
          'Performance e Escalabilidade',
          'FAQs Técnicos'
        ],
        Mercado: [
          'Tendências de Mercado',
          'Inovação Tecnológica',
          'Análise Competitiva',
          'Regulamentações e Compliance',
          'ROI e Impacto Financeiro'
        ]
      }

      for (const category of categories) {
        const subcategoryList =
          subcategoriesMap[category.name as keyof typeof subcategoriesMap] || []

        await tx
          .insert(subcategory)
          .values({
            name: `${category.name} Default Subcategory`,
            slug: `${category.slug}-default`,
            categoryId: category.id,
            isDefault: true
          })
          .returning()

        for (const subcategoryName of subcategoryList) {
          await tx
            .insert(subcategory)
            .values({
              name: subcategoryName,
              slug: slug(subcategoryName),
              description: `Article about ${subcategoryName}`,
              categoryId: category.id
            })
            .returning()
        }
      }

      logger.info('Seed - Started post!')

      for (const postItem of postsData) {
        const subcat = await tx.query.subcategory.findFirst({
          where: eq(subcategory.slug, postItem.subcategorySlug)
        })

        if (!subcat) {
          logger.warn(
            `Subcategoria ${postItem.subcategorySlug} não encontrada!`
          )
          continue
        }

        const author = await tx.query.user.findFirst({
          where: and(
            eq(user.role, postItem.authorRole as 'admin' | 'editor' | 'user'),
            not(eq(user.email, 'anonymous'))
          )
        })

        if (!author) {
          logger.warn(`Autor ${postItem.authorRole} não encontrado!`)
          continue
        }

        const existUserCategory = await tx.query.userToCategory.findFirst({
          where: and(
            eq(userToCategory.userId, author.id),
            eq(userToCategory.categoryId, subcat.categoryId)
          )
        })

        if (!existUserCategory) {
          await tx.insert(userToCategory).values({
            userId: author.id,
            categoryId: subcat.categoryId
          })
        }

        await tx.insert(post).values({
          title: postItem.title,
          slug: postItem.slug,
          excerpt: postItem.excerpt,
          content: postItem.content,
          featuredImage: postItem.featuredImage,
          status: postItem.status as 'draft' | 'published' | 'archived',
          subcategoryId: subcat.id,
          authorId: author.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          publishedAt: new Date()
        })
      }

      logger.info('Seed concluded with success!')
    })
  } catch (error) {
    logger.error('Error on start seed:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}
seed()
