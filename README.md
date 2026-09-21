# DSS Hub

Painel interno da DSS Hub Tech para acompanhar clientes, projetos e o financeiro da
empresa em um lugar só. É um PWA, então dá para instalar no computador e no celular e
usar como um aplicativo, com login por conta Google e os dados sincronizados entre as
sócias em tempo real.

A ideia é simples: sair das planilhas soltas e do "está anotado em algum lugar" e ter
uma central onde a gente enxerga de relance quanto entrou no mês, quem está para vencer
e onde ficam os links e os acessos de cada cliente.

## O que dá para fazer

O início mostra o resumo do dia: caixa do mês, receita recorrente, clientes ativos e os
próximos vencimentos, com destaque para quem está atrasado.

Em clientes fica o cadastro completo de cada um: contato, forma e dia de pagamento, valor
da mensalidade, status e observações. Cada cliente também guarda os links do próprio
projeto, quantos precisar, e cada link vem com uma descrição e um espaço para comentar
o que for útil (onde acessa, qual o plano, o que combinaram).

Em financeiro ficam os lançamentos de entrada, o cálculo da receita recorrente e um
gráfico com o que entrou nos últimos meses. Ao registrar uma entrada e escolher o
cliente, o status dele em Clientes vira automaticamente **Pago** naquele mês (e ele sai
da lista de próximos vencimentos); sem pagamento no mês, o status segue pelo dia de
vencimento (a vencer / vence hoje / atrasado).

Tudo funciona no tema claro e no escuro, e a interface foi pensada para ser rápida no
computador e confortável no celular.

## Como rodar na sua máquina

Você vai precisar do Node instalado. Com o projeto aberto no terminal:

    npm install
    npm run dev

Depois é só abrir http://localhost:5173.

O projeto já vem ligado à nuvem da DSS Hub (a configuração pública do Firebase fica
embutida como reserva), então rodar `npm run dev` já usa o login Google real e o banco
em nuvem.

## Modo demonstração (para desenvolvimento)

Para mexer na interface sem precisar logar com o Google, rode em modo demonstração: o
login é fictício e os dados ficam salvos só no navegador.

    VITE_DEMO=1 npm run dev

## Apontando para outro Firebase

Para usar um projeto Firebase diferente, crie um arquivo `.env` (copie de `.env.example`)
e preencha as variáveis — elas têm prioridade sobre a configuração embutida. Do lado do
Firebase:

1. Em Authentication, ative a entrada com Google.
2. Em Firestore Database, crie o banco em modo produção.
3. Em `VITE_ALLOWED_EMAILS`, coloque os e-mails autorizados a entrar, separados por
   vírgula. Só esses conseguem logar.
4. Publique as regras do arquivo `firestore.rules` no Firestore, ajustando a mesma lista
   de e-mails. É isso que garante que só a equipe acessa os dados.

## Publicando na Vercel

Suba o projeto no GitHub e importe na Vercel escolhendo o framework Vite. Nas variáveis
de ambiente da Vercel, repita as mesmas chaves do `.env`. Por fim, no Firebase, em
Authentication, adicione o domínio da Vercel à lista de domínios autorizados para o login
funcionar em produção.

## Como o código está organizado

O projeto é feito em React com Vite e TypeScript, estilizado com Tailwind. O acesso aos
dados fica isolado em uma camada única que fala com o Firestore quando há nuvem ou com o
armazenamento local quando está em demonstração, então as telas não precisam saber onde
os dados moram. As páginas ficam em `src/pages`, os componentes reutilizáveis em
`src/components` e a base de dados e utilitários em `src/lib`.
