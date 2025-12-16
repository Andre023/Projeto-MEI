import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link, usePage } from "@inertiajs/react";
import { User } from '@/types';
import { PropsWithChildren, ReactNode, useState, useEffect } from "react";
import { Transition } from '@headlessui/react';
import { Moon, Sun } from "lucide-react";

export default function Authenticated({
  header,
  children,
}: PropsWithChildren<{ header?: ReactNode }>) {

  const { user } = usePage().props.auth as { user: User };

  const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

  // --- Lógica do Dark Mode ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Verifica se estamos no navegador antes de acessar window/localStorage
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Atualiza a classe no HTML e salva no localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-16 transition-colors duration-300">

      <nav className="fixed top-0 left-0 w-full z-50 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex shrink-0 items-center">
                <Link href="/">
                  <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                </Link>
              </div>

              <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                <NavLink href={route("dashboard")} active={route().current("dashboard")}>
                  Dashboard
                </NavLink>
                <NavLink href={route("clientes")} active={route().current("clientes")}>
                  Clientes
                </NavLink>
                <NavLink href={route("arvore")} active={route().current("arvore")}>
                  Árvores
                </NavLink>
                <NavLink href={route("produtos")} active={route().current("produtos")}>
                  Produtos
                </NavLink>
                <NavLink href={route('vendas')} active={route().current('vendas')}>
                  Vendas
                </NavLink>
                <NavLink href={route('estatisticas')} active={route().current('estatisticas')}>
                  Estatísticas
                </NavLink>
              </div>
            </div>

            <div className="hidden sm:ms-6 sm:flex sm:items-center gap-4">

              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors focus:outline-none"
                title={isDarkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="relative ms-3">
                <Dropdown>
                  <Dropdown.Trigger>
                    <span className="inline-flex rounded-md">
                      <button
                        type="button"
                        className="inline-flex items-center rounded-md border border-transparent bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium leading-4 text-gray-500 dark:text-gray-400 transition duration-150 ease-in-out hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                      >
                        {user.profile_photo_url ? (
                          <img
                            src={user.profile_photo_url}
                            alt="Foto de Perfil"
                            className="h-10 w-10 rounded-full object-cover me-2"
                          />
                        ) : (
                          <span className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center me-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-500 dark:text-gray-300">
                              <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.78 6.125-2.095a1.23 1.23 0 00.41-1.412A9.99 9.99 0 0010 13c-2.31 0-4.438.78-6.125 2.095z" />
                            </svg>
                          </span>
                        )}

                        {user.name}

                        <svg
                          className="-me-0.5 ms-2 h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </span>
                  </Dropdown.Trigger>

                  <Dropdown.Content>
                    <Dropdown.Link href={route("profile.edit")}>
                      Perfil
                    </Dropdown.Link>
                    <Dropdown.Link href={route("logout")} method="post" as="button">
                      Sair
                    </Dropdown.Link>
                  </Dropdown.Content>
                </Dropdown>
              </div>
            </div>

            <div className="-me-2 flex items-center sm:hidden gap-2">

              {/* --- 4. Botão Dark Mode (Mobile) --- */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
              {/* ---------------------------------- */}

              <button
                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-500 dark:hover:text-gray-400 focus:bg-gray-100 dark:focus:bg-gray-700 focus:text-gray-500 dark:focus:text-gray-400 focus:outline-none"
              >
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path
                    className={!showingNavigationDropdown ? "inline-flex" : "hidden"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                  <path
                    className={showingNavigationDropdown ? "inline-flex" : "hidden"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <Transition
          show={showingNavigationDropdown}
          enter="transition-all duration-300 ease-out overflow-hidden"
          enterFrom="max-h-0 opacity-0"
          enterTo="max-h-screen opacity-100"
          leave="transition-all duration-200 ease-in overflow-hidden"
          leaveFrom="max-h-screen opacity-100"
          leaveTo="max-h-0 opacity-0"
        >
          <div className="sm:hidden bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
            <div className="space-y-1 pb-3 pt-2">
              <ResponsiveNavLink href={route("dashboard")} active={route().current("dashboard")}>
                Dashboard
              </ResponsiveNavLink>
              <ResponsiveNavLink href={route("clientes")} active={route().current("clientes")}>
                Clientes
              </ResponsiveNavLink>
              <ResponsiveNavLink href={route("arvore")} active={route().current("arvore")}>
                Árvore
              </ResponsiveNavLink>
              <ResponsiveNavLink href={route("produtos")} active={route().current("produtos")}>
                Produtos
              </ResponsiveNavLink>
              <ResponsiveNavLink href={route("vendas")} active={route().current("vendas")}>
                Vendas
              </ResponsiveNavLink>
              <ResponsiveNavLink href={route("estatisticas")} active={route().current("estatisticas")}>
                Estatísticas
              </ResponsiveNavLink>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pb-1 pt-4">
              <div className="px-4 flex items-center">
                <div className="shrink-0 me-3">
                  {user.profile_photo_url ? (
                    <img
                      src={user.profile_photo_url}
                      alt="Foto de Perfil"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-gray-500 dark:text-gray-300">
                        <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.78 6.125-2.095a1.23 1.23 0 00.41-1.412A9.99 9.99 0 0010 13c-2.31 0-4.438.78-6.125 2.095z" />
                      </svg>
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                    {user.name}
                  </div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {user.email}
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <ResponsiveNavLink href={route("profile.edit")}>
                  Perfil
                </ResponsiveNavLink>
                <ResponsiveNavLink method="post" href={route("logout")} as="button">
                  Sair
                </ResponsiveNavLink>
              </div>
            </div>
          </div>
        </Transition>
      </nav>

      {header && (
        <header className="bg-white dark:bg-gray-800 shadow transition-colors duration-300">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="dark:text-gray-200">
              {header}
            </div>
          </div>
        </header>
      )}

      <main className="main-content dark:text-gray-200">{children}</main>
    </div>
  );
}