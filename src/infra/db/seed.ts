import { env } from '@/env'
import { db } from '.'
import { makePasswordHasher } from '../cryptography/password'
import { slug } from '../helpers/string'
import { logger } from '../lib/logger/logger-server'
import { account } from './schemas/auth/account'
import { user } from './schemas/auth/user'
import { category } from './schemas/blog/category'
import { subcategory } from './schemas/blog/subcategory'

async function seed() {
  try {
    logger.info('Start seed DB...')

    try {
      const [newUser] = await db
        .insert(user)
        .values({
          name: 'Admin',
          email: env.ADMIN_EMAIL,
          emailVerified: true,
          role: 'admin',
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

    logger.info('Seed concluided with success!')
  } catch (error) {
    logger.error('Error on start seed:', error)
  }
}
seed()
