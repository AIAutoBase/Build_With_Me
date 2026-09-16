# Pacote da Classe 6 — atualização

Esta é uma tradução. O original está em ../UPDATE.md. Quando há discrepâncias, o inglês está correto.

Other languages: [Español](UPDATE.es.md) · [Português](UPDATE.pt.md) · [Italiano](UPDATE.it.md) · [हिन्दी](UPDATE.hi.md) · [اردو](UPDATE.ur.md) · [ไทย](UPDATE.th.md) · [English](../UPDATE.md)

**Este pacote foi executado do início ao fim em uma máquina Debian 13 limpa, e três coisas na versão anterior foram quebradas por uma nova versão do graphify. Todas as três estão corrigidas aqui.**

---

## A forma mais rápida de instalar isso

Você não precisa ler o pacote primeiro. Passe o zip para Claude Code e deixe que faça o trabalho, incluindo corrigir o que quebrar em sua máquina.

Coloque o zip em uma pasta, abra Claude Code nessa pasta, e cole isso:

```text
Read class-06-graph-pack.zip in this folder. Unzip it, read every file in it, and then
install it on this machine following PREWORK.md and prompts/P1-install.md.

Rules:
- Explain each step before you run it, and stop rather than guess.
- Never tell me a step passed unless you saw its output say so.
- This tool READS my documents. Do not modify my database, my workflows or my containers.
- Pass --backend=claude-cli explicitly on anything that uses a model. The free path is
  never selected for me automatically.
- If something fails, read the error, check TROUBLESHOOT.md, and fix it. Tell me what
  you changed and why.
- Finish by running verify.sh and reading me its output.
```

Essa é toda a instalação. Claude Code lê o pacote, enfrenta as armadilhas, e trabalha através delas com você observando.

**Se ficar preso na mesma coisa duas vezes, pare** e publique o comando exato e o erro exato na comunidade. A redação de um erro é o diagnóstico.

---

## Verificado em

| | |
|---|---|
| Sistema operacional | **Debian 13 (trixie)**, x86-64, sem GPU |
| Python | 3.13.5 |
| graphify | **0.9.62** (o pacote anterior foi medido contra 0.9.49) |
| Claude Code | 2.1.258, conectado |
| Execução | P1 a P4, do início ao fim, em uma máquina já executando a pilha de Classe 3 |

O que produziu naquela máquina:

| | |
|---|---|
| Passe estrutural | 1.7 s · 69 nós · 57 arestas · 12 comunidades · **0 tokens** |
| Trilha de auditoria | **100% EXTRAÍDO · 0% INFERIDO · 0% AMBÍGUO** |
| Passe de nomeação | 11.5 s · 58,301 entrada / 655 saída · **$0.00** |
| Gráfico por HTTP | **200 em 2.3 ms**, de uma máquina diferente na rede |
| `verify.sh` | **12 passados · 0 falhados** |

Seus números serão diferentes. Esses são um corpus em uma máquina, não um alvo.

---

## O que mudou, e por quê

### 1. O passe de nomeação se moveu para seu próprio comando

O graphify 0.9.62 já não aceita `--backend` em `update`. Execute o comando antigo e você recebe:

```text
error: unknown update option: --backend
```

`--no-label` também se moveu. A classe agora usa:

```bash
graphify update <folder>                        # structure. still zero tokens
graphify label  <folder> --backend=claude-cli   # names. still free, still explicit
```

**A armadilha de custo sobreviveu à renomeação.** `label` detecta automaticamente um backend a partir de suas chaves de API exatamente como `update` costumava fazer, e `claude-cli` ainda não está na lista de detecção. Se você tem uma chave OpenRouter exportada como `OPENAI_API_KEY`, a detecção automática a encontra e toma o caminho pago. Gratuito e pago parecem idênticos na tela. Passe `--backend=claude-cli` toda vez.

Cada prompt, slide e página no pacote agora diz `label`.

### 2. Instalar graphify não instala o servidor MCP que instala

O P4 registra seu gráfico como um servidor MCP para que o cérebro possa consultar sua própria forma. No 0.9.62, essa etapa morreu em `claude mcp list` com **"Failed to connect"** e sem nenhuma outra pista.

A causa: `pip install graphifyy` coloca o executável `graphify-mcp` em seu PATH **sem a biblioteca que importa para servir**. Então `which graphify-mcp` o encontra. Pior ainda:

```bash
graphify-mcp --help     # prints usage on a machine where the server cannot start
```

Imprime o uso porque o analisador de argumentos é executado antes da importação. É uma verificação que não pode falhar, o que significa que não é uma verificação — a mesma lição que esta classe ensinou três vezes agora, e desta vez foi nosso próprio script.

A correção é uma linha, e está em P4:

```bash
pip install "graphifyy[mcp]"
```

`verify.sh` agora importa o módulo com o próprio intérprete do venv em vez de confiar em `--help`.

### 3. O gráfico foi renderizado como uma página em branco enquanto o servidor retornava 200

Este é o sério, e é a razão pela qual esta atualização existe.

O graphify 0.9.62 escreve um hash de **`integrity`** na tag de script que carrega a biblioteca de visualização de um CDN. `vendor-vis.sh` reaponta o `src` para sua cópia local e deixou esse hash para trás. O hash pertence a uma compilação diferente da biblioteca, então o navegador se recusou a executar o arquivo que havia acabado de baixar, e a página não desenhou nada.

Cada verificação que a classe ensinou ainda passou:

| Verificação | Disse |
|---|---|
| `grep -o 'src="..."'` | um caminho local, sem URLs |
| `ls -l vis-network.min.js` | 652,000 bytes |
| `head -c 100 vis-network.min.js` | JavaScript, não uma página de erro |
| `curl -o /dev/null -w "%{http_code}"` | **200** |

A única evidência em qualquer lugar era uma linha no console do navegador: `vis is not defined`.

`vendor-vis.sh` agora faz um hash do arquivo que realmente baixou, escreve esse hash, descarta `crossorigin`, e **se recusa a terminar** se um hash que não escreveu sobreviver. Foi testado depois em um navegador real: os nós estão na tela, e a página faz **duas solicitações de rede, ambas para sua própria máquina** — que é a afirmação offline testada em vez de afirmada.

**Se você já construiu um gráfico com o script antigo, execute novamente o novo `vendor-vis.sh`.**
Sua página pode estar em branco por essa razão e nada teria lhe dito.

---

## Também vale a pena saber

`TROUBLESHOOT.md` tem três novas entradas: o erro `unknown update option`, o `Failed to connect` no MCP, e a página em branco que retorna 200.

**Execute novamente `vendor-vis.sh` após cada `graphify update`.** Reconstruir o gráfico reescreve a página e o link do CDN volta. Sua página offline silenciosamente se torna uma página online, e você descobre em um lugar sem internet, que é exatamente quando a queria.

O gráfico é um **snapshot**. Ele não atualiza quando você adiciona um documento. Um gráfico obsoleto não gera erro — responde, confiante, sobre documentos que você mudou desde então.

---

## Atribuição, inalterada

O graphify é **Apache-2.0**, de `Graphify-Labs/graphify`, e a atribuição é uma condição dessa licença em vez de uma cortesia. É fornecido em `ATTRIBUTION.md`. Leia-o. A classe ensina que seu cérebro deve ser navegável; graphify é uma implementação disso, não o assunto.

---

*The Brain That Runs a Company — Class 6. AI Auto Base. Created by Hector Diaz, founder of Orbix Automation Solutions.*
