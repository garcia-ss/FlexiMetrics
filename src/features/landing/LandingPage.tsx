import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, ArrowRight, LineChart, Trophy, Filter, Users, Calculator, Download } from 'lucide-react'
import { Button } from '@/components/ui'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

const FEATURES = [
  { icon: LineChart, title: 'Dashboard analítico', desc: 'KPIs, distribuições e evolução das turmas em gráficos interativos.' },
  { icon: Calculator, title: 'Cálculo automático', desc: 'Informe peso, altura e cintura — IMC, RCE e classificação saem prontos.' },
  { icon: Trophy, title: 'Ranking de desempenho', desc: 'Pódios automáticos por métrica para estimular seus alunos.' },
  { icon: Filter, title: 'Filtros inteligentes', desc: 'Recorte por turma, gênero, idade e classificação com um clique.' },
  { icon: Users, title: 'Gestão de alunos', desc: 'Tabela paginada, busca instantânea e histórico de avaliações.' },
  { icon: Download, title: 'Exportação CSV', desc: 'Leve suas métricas para o sistema escolar quando precisar.' },
]

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-volt text-volt-ink">
            <Activity className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-ink">FlexiMetrics</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login">
            <Button>Acessar sistema</Button>
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 pb-24 pt-10">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-volt/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block rounded-full border border-volt/30 bg-volt-soft px-3 py-1 text-xs font-bold uppercase tracking-widest text-volt"
          >
            Performance física · Data-driven
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-6 text-4xl font-extrabold leading-tight text-ink sm:text-6xl"
          >
            A evolução física dos seus alunos, <span className="text-volt">medida de verdade</span>.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted"
          >
            FlexiMetrics é a plataforma para professores e personais acompanharem desempenho, indicadores de
            saúde e progresso — turma a turma, aluno a aluno.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-10 flex justify-center"
          >
            <Link to="/login">
              <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                Começar agora
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-[var(--radius-lg)] border border-line bg-card p-6 shadow-[var(--shadow-sm)] transition-colors hover:border-volt/40"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-volt-soft text-volt">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm text-muted">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}
