import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'

// Simulação de FAQs - em produção, viriam do banco de dados
const faqs = [
  {
    id: 1,
    question: 'Como posso pesquisar por um tópico específico?',
    answer:
      'Você pode usar a barra de pesquisa na página inicial ou dentro de qualquer categoria. Digite palavras-chave relacionadas ao tópico que você está procurando e pressione Enter.'
  },
  {
    id: 2,
    question: 'Como faço para me inscrever na newsletter?',
    answer:
      "No rodapé de cada página, você encontrará um formulário de inscrição para nossa newsletter. Basta inserir seu e-mail e clicar em 'Inscrever-se'."
  },
  {
    id: 3,
    question: 'Posso contribuir com artigos para o blog?',
    answer:
      'Sim! Aceitamos contribuições de escritores convidados. Entre em contato conosco através da página de contato para mais informações sobre o processo de submissão.'
  },
  {
    id: 4,
    question: 'Com que frequência novos artigos são publicados?',
    answer:
      'Publicamos novos artigos várias vezes por semana. Recomendamos que você se inscreva em nossa newsletter para receber notificações sobre novos conteúdos.'
  }
]

export function Faq() {
  return (
    <section className="container mx-auto px-4 md:px-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
          Perguntas Frequentes
        </h2>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Respostas para as dúvidas mais comuns sobre nosso blog
        </p>
      </div>
      <div className="mx-auto mt-8 max-w-3xl">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={`item-${faq.id}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
