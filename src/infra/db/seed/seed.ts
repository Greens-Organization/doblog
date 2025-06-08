import { env } from '@/env'
import { generateRandomURLAvatar } from '@/infra/helpers/dicebear'
import { and, eq } from 'drizzle-orm'
import { db } from '..'
import { makePasswordHasher } from '../../cryptography/password'
import { slug } from '../../helpers/string'
import { logger } from '../../lib/logger/logger-server'
import { member, organization } from '../schemas/auth'
import { account } from '../schemas/auth/account'
import { user } from '../schemas/auth/user'
import { post } from '../schemas/blog'
import { category } from '../schemas/blog/category'
import { subcategory } from '../schemas/blog/subcategory'
import postsData from './assets/posts.json'

async function seed() {
  try {
    logger.info('Start seed DB...')

    try {
      logger.info('Clear DB...')
      await db.delete(organization)
      await db.delete(member)
      await db.delete(account)
      await db.delete(post)
      await db.delete(category)
      await db.delete(subcategory)
      logger.info('Clear DB completed!')
    } catch (error) {
      logger.error('Seed - Problems in clear db')
    }

    try {
      logger.info('Seed - Create Org!')
      const name = 'Doblog'
      const [orgData] = await db
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
      logger.info('Seed - Creating admin!')
      const [newUser] = await db
        .insert(user)
        .values({
          name: 'Admin Person',
          email: env.ADMIN_EMAIL,
          emailVerified: true,
          role: 'admin',
          image: generateRandomURLAvatar({ type: 'notionists' }),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning()

      await db
        .insert(account)
        .values({
          accountId: crypto.randomUUID(),
          userId: newUser!.id,
          providerId: 'credential',
          password: await makePasswordHasher().hash(env.ADMIN_PASSWORD),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning()

      await db
        .insert(member)
        .values({
          organizationId: orgData.id,
          userId: newUser.id,
          role: 'admin'
        })
        .returning()
      logger.info('Seed - Admin created!')

      logger.info('Seed - Creating editor!')
      const [newEditorUser] = await db
        .insert(user)
        .values({
          name: 'Editor Person',
          email: 'editor@editor.com',
          emailVerified: true,
          role: 'editor',
          image: generateRandomURLAvatar({ type: 'notionists' }),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning()

      await db
        .insert(account)
        .values({
          accountId: crypto.randomUUID(),
          userId: newEditorUser!.id,
          providerId: 'credential',
          password: await makePasswordHasher().hash('321editor.'),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning()

      await db
        .insert(member)
        .values({
          organizationId: orgData.id,
          userId: newEditorUser.id,
          role: 'editor'
        })
        .returning()
      logger.info('Seed - Editor created!')
    } catch (error) {
      logger.error('Seed - Account exist')
    }

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

    const categories = await db
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

      await db
        .insert(subcategory)
        .values({
          name: `${category.name} Default Subcategory`,
          slug: `${category.slug}-default`,
          categoryId: category.id,
          isDefault: true
        })
        .returning()

      for (const subcategoryName of subcategoryList) {
        await db
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

    try {
      logger.info('Seed - Started post!')

      for (const postItem of postsData) {
        const subcat = await db.query.subcategory.findFirst({
          where: eq(subcategory.slug, postItem.subcategorySlug)
        })

        if (!subcat) {
          logger.warn(
            `Subcategoria ${postItem.subcategorySlug} não encontrada!`
          )
          continue
        }

        const author = await db.query.user.findFirst({
          where: and(
            eq(user.role, postItem.authorRole as 'admin' | 'editor' | 'user')
          )
        })

        if (!author) {
          logger.warn(`Autor ${postItem.authorRole} não encontrado!`)
          continue
        }

        await db.insert(post).values({
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
    } catch (error) {
      logger.info('Seed problem in post creation!')
    }

    logger.info('Seed concluded with success!')
  } catch (error) {
    console.error('Error on start seed:', error)
    logger.error('Error on start seed:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}
seed()
