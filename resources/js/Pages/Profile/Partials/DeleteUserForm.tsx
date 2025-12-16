import DangerButton from "@/Components/DangerButton";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import Modal from "@/Components/Modal";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";
import { useForm } from "@inertiajs/react";
import { FormEventHandler, useRef, useState } from "react";

export default function DeleteUserForm({
  className = "",
}: {
  className?: string;
}) {
  const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
  const passwordInput = useRef<HTMLInputElement>(null);

  const {
    data,
    setData,
    delete: destroy,
    processing,
    reset,
    errors,
    clearErrors,
  } = useForm({
    password: "",
  });

  const confirmUserDeletion = () => {
    setConfirmingUserDeletion(true);
  };

  const deleteUser: FormEventHandler = (e) => {
    e.preventDefault();

    destroy(route("profile.destroy"), {
      preserveScroll: true,
      onSuccess: () => closeModal(),
      onError: () => passwordInput.current?.focus(),
      onFinish: () => reset(),
    });
  };

  const closeModal = () => {
    setConfirmingUserDeletion(false);

    clearErrors();
    reset();
  };

  return (
    <section className={`space-y-6 ${className}`}>
      <header>
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Deletar conta</h2>

        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Uma vez que sua conta é deletada, todos os seus recursos e dados serão
          permanentemente deletados. Antes de deletar sua conta, por favor, baixe qualquer
          dado ou informação que você deseja reter.
        </p>
      </header>

      <DangerButton onClick={confirmUserDeletion}>Deletar conta</DangerButton>

      <Modal show={confirmingUserDeletion} onClose={closeModal}>
        {/* Adicionada a classe dark:bg-gray-800 e cor de texto */}
        <form onSubmit={deleteUser} className="p-6 bg-white dark:bg-gray-800 transition-colors">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Você tem certeza que deseja deletar sua conta?
          </h2>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Uma vez que sua conta é deletada, todos os seus recursos e dados serão
            permanentemente deletados. Por favor, insira sua senha para confirmar que você deseja
            deletar sua conta.
          </p>

          <div className="mt-6">
            <InputLabel
              htmlFor="password"
              value="Senha"
              className="sr-only dark:text-gray-300"
            />

            <TextInput
              id="password"
              type="password"
              name="password"
              ref={passwordInput}
              value={data.password}
              onChange={(e) => setData("password", e.target.value)}
              className="mt-1 block w-3/4"
              isFocused
              placeholder="Senha"
            />

            <InputError message={errors.password} className="mt-2" />
          </div>

          <div className="mt-6 flex justify-end">
            <SecondaryButton onClick={closeModal}>Cancelar</SecondaryButton>

            <DangerButton className="ms-3" disabled={processing}>
              Deletar conta
            </DangerButton>
          </div>
        </form>
      </Modal>
    </section>
  );
}