import { PageProps } from "@/types";
import { Head, Link } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import {
  ShoppingBag,
  Users,
  Package,
  BarChart3,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export default function Welcome({
  auth,
  laravelVersion,
  phpVersion,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
  return (
    <>
      <Head title="Bem-vindo ao Projeto MEI" />

      <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">

        {/* --- NAVBAR --- */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <ApplicationLogo className="h-10 w-10 text-indigo-600" />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  Projeto MEI
                </span>
              </div>

              <div className="flex items-center gap-4">
                {auth.user ? (
                  <Link
                    href={route("dashboard")}
                    className="font-semibold text-gray-600 hover:text-indigo-600 transition"
                  >
                    Ir para o Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href={route("login")}
                      className="font-medium text-gray-600 hover:text-gray-900 px-4 py-2 transition"
                    >
                      Entrar
                    </Link>
                    <Link
                      href={route("register")}
                      className="hidden sm:inline-flex bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-medium transition shadow-lg shadow-indigo-200"
                    >
                      Criar Conta
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* --- HERO SECTION --- */}
        <main className="flex-grow">
          <div className="relative overflow-hidden pt-16 pb-24 lg:pt-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-6 border border-indigo-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Gestão simplificada para o seu negócio
              </span>

              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
                O controle total do seu <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  negócio em um só lugar
                </span>
              </h1>

              <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto mb-10">
                Gerencie vendas, estoque, clientes e visualize seus lucros em tempo real.
                A ferramenta perfeita para Microempreendedores Individuais.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {auth.user ? (
                  <Link
                    href={route("dashboard")}
                    className="inline-flex justify-center items-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-200 transition-all hover:-translate-y-1"
                  >
                    Acessar meu Painel
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                ) : (
                  <Link
                    href={route("register")}
                    className="inline-flex justify-center items-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-200 transition-all hover:-translate-y-1"
                  >
                    Começar Gratuitamente
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                )}

                {!auth.user && (
                  <Link
                    href={route("login")}
                    className="inline-flex justify-center items-center px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-bold text-lg transition-all"
                  >
                    Já tenho conta
                  </Link>
                )}
              </div>
            </div>

            {/* Background Decorativo */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
              <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
              <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>
          </div>

          {/* --- FUNCIONALIDADES (FEATURES) --- */}
          <div className="bg-white py-24 border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900">Tudo o que você precisa</h2>
                <p className="mt-4 text-lg text-gray-500">Ferramentas essenciais integradas para facilitar o seu dia a dia.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Feature 1 */}
                <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow group">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Gestão de Vendas</h3>
                  <p className="text-gray-500 leading-relaxed">
                    Registre suas vendas de forma rápida, mantenha o histórico e saiba exatamente quanto vendeu.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow group">
                  <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Users className="w-7 h-7 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Controle de Clientes</h3>
                  <p className="text-gray-500 leading-relaxed">
                    Cadastre seus clientes, visualize histórico de compras e fidelize seu público.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow group">
                  <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Package className="w-7 h-7 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Estoque Inteligente</h3>
                  <p className="text-gray-500 leading-relaxed">
                    Acompanhe a entrada e saída de produtos. Receba alertas de estoque baixo automaticamente.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow group">
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Relatórios Detalhados</h3>
                  <p className="text-gray-500 leading-relaxed">
                    Visualize gráficos de faturamento e lucro. Tome decisões baseadas em dados reais.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* --- LISTA DE BENEFÍCIOS --- */}
          <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-indigo-900 rounded-3xl p-8 md:p-16 overflow-hidden relative text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="relative z-10 max-w-xl">
                <h2 className="text-3xl font-bold text-white mb-6">Pronto para organizar seu negócio?</h2>
                <ul className="space-y-4 text-indigo-100 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="text-green-400 w-6 h-6" />
                    <span>Interface simples e intuitiva</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="text-green-400 w-6 h-6" />
                    <span>Acesso rápido via celular ou computador</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="text-green-400 w-6 h-6" />
                    <span>Sem mensalidades abusivas</span>
                  </li>
                </ul>

                {!auth.user && (
                  <Link
                    href={route("register")}
                    className="inline-block bg-white text-indigo-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition"
                  >
                    Criar minha conta agora
                  </Link>
                )}
              </div>

              {/* Simulação visual abstrata */}
              <div className="relative z-10">
                <div className="w-64 h-64 bg-indigo-800 rounded-full flex items-center justify-center relative">
                  <div className="absolute inset-0 border-2 border-indigo-700 rounded-full animate-pulse"></div>
                  <BarChart3 className="w-32 h-32 text-indigo-400 opacity-50" />
                </div>
              </div>

              {/* Círculos de fundo */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-800 rounded-full opacity-50 blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
            </div>
          </div>
        </main>

        <footer className="bg-white border-t border-gray-100 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <ApplicationLogo className="h-8 w-8 text-gray-400" />
              <span className="font-semibold text-gray-500">Projeto MEI</span>
            </div>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Projeto MEI. Feito com Laravel v{laravelVersion} (PHP v{phpVersion}).
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}