# Corrigir cor do título no bloco "Números"

No bloco de Números (`src/components/landing/Metrics.tsx`), a frase "Números que fazem o" aparece invisível porque tem a mesma cor do fundo escuro do bloco.

## Causa (confirmada)

- O `<section>` usa `bg-ink` → `--ink = oklch(0.2103 0.0059 286)` (fundo grafite escuro).
- A base layer em `src/styles.css` define `h2 { color: var(--color-foreground) }` → `--foreground = oklch(0.2103 0.0059 286)`, **idêntico** ao fundo.
- O `text-ink-foreground` (branco) aplicado no `<section>` é herdado pelo texto comum, mas é sobrescrito no `<h2>` pela regra base de heading.
- Apenas o `<span className="text-brand">` (laranja) aparece.

## Correção

Em `src/components/landing/Metrics.tsx`, adicionar a classe utilitária `text-ink-foreground` ao `<h2>` para que o título herde o branco do bloco, sobrepondo a regra base de heading:

```tsx
<h2 className="text-center text-3xl font-black tracking-tight text-ink-foreground sm:text-4xl">
  Números que fazem o <span className="text-brand">negócio girar</span>
</h2>
```

Nenhuma outra alteração necessária — o `<span>` continua laranja e o subtítulo já herda o branco do `<section>`.

## Verificação

Screenshot do bloco "Números" confirmando "Números que fazem o" em branco e "negócio girar" em laranja.
