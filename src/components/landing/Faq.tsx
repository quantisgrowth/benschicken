import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ITEMS = [
  {
    q: "Preciso ter experiência prévia no setor de alimentação?",
    a: "Não. A operação é padronizada com fichas técnicas, treinamento inicial e acompanhamento do time de expansão. Quem já atua no setor tende a ativar mais rápido, mas o modelo foi desenhado para funcionar também na primeira operação.",
  },
  {
    q: "Como funciona o fornecimento dos temperos e insumos homologados?",
    a: "Os temperos exclusivos e itens críticos de sabor são fornecidos pela marca. Os demais insumos vêm de fornecedores homologados, com tabela de preços negociada e lista de substitutos aprovados por região.",
  },
  {
    q: "Posso operar o Licenciamento utilizando a conta do iFood que já tenho?",
    a: "Sim. No licenciamento as marcas entram como novas lojas dentro da sua estrutura de aplicativos, aproveitando o histórico e a reputação da sua conta, com suporte na criação e configuração do cardápio.",
  },
  {
    q: "Qual a área mínima necessária para abrir uma Franquia Dark Kitchen?",
    a: "A partir de 60m² é possível operar as duas marcas com conforto. O layout compacto foi desenhado para reduzir custo de obra, aluguel e equipe.",
  },
  {
    q: "Em quanto tempo a marca é ativada na minha cozinha existente?",
    a: "Em média de 15 a 30 dias, considerando assinatura do contrato, treinamento da equipe, adequação de utensílios e publicação das lojas nos aplicativos.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-center text-3xl font-black tracking-tight sm:text-4xl">
          Perguntas <span className="text-brand">Frequentes</span>
        </h2>
        <p className="mt-4 text-center text-sm text-muted-foreground sm:text-base">
          As dúvidas mais comuns de quem está avaliando operar a Ben&apos;s.
        </p>

        <Accordion type="single" collapsible className="mt-10 w-full">
          {ITEMS.map((item, i) => (
            <AccordionItem key={item.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-bold">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
