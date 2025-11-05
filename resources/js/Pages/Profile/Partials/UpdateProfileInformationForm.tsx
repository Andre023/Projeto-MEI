import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from "@/Components/TextInput";
import { Transition } from "@headlessui/react";
import { Link, useForm, usePage } from "@inertiajs/react";
// --- 1. IMPORTAR 'useRef' ---
import { FormEventHandler, useState, ChangeEvent, useRef, Fragment } from "react";
import { PageProps, User } from '@/types';

export default function UpdateProfileInformation({
  mustVerifyEmail,
  status,
  className = "",
}: {
  mustVerifyEmail: boolean;
  status?: string;
  className?: string;
}) {
  const { user } = usePage<PageProps>().props.auth;

  // --- 2. CRIAR A REF PARA O INPUT DE ARQUIVO ---
  const photoInput = useRef<HTMLInputElement>(null);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const { data, setData, post, errors, processing, recentlySuccessful } =
    useForm({
      _method: 'patch',
      name: user.name,
      email: user.email,
      profile_photo: null as File | null,
      remove_profile_photo: false as boolean,
    });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    post(route("profile.update"), {
      forceFormData: true,
      onSuccess: () => {
        setPhotoPreview(null);
        setData('remove_profile_photo', false);
        // Limpa o input de arquivo
        if (photoInput.current) {
          photoInput.current.value = "";
        }
      },
    });
  };

  // --- 3. CRIAR A FUNÇÃO PARA ACIONAR O CLIQUE ---
  const selectNewPhoto = () => {
    photoInput.current?.click();
  };

  // Handler para quando o arquivo é selecionado
  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setData('profile_photo', file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // Handler para remover a foto
  const removePhoto = () => {
    setData({
      ...data,
      profile_photo: null,
      remove_profile_photo: true,
    });
    setPhotoPreview(null);

    post(route('profile.update'), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        setData('remove_profile_photo', false);
      },
    });
  };

  return (
    <section className={className}>
      <header>
        <h2 className="text-lg font-medium text-gray-900">
          Informações do perfil
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Atualize as informações do perfil e o endereço de e-mail da sua conta.
        </p>
      </header>

      <form onSubmit={submit} className="mt-6 space-y-6">

        {/* --- CAMPO DA FOTO DE PERFIL --- */}
        <div>
          <InputLabel htmlFor="profile_photo" value="Foto de perfil" />

          {/* Exibe o preview ou a foto atual */}
          <div className="mt-2 flex items-center space-x-4">
            <span className="h-20 w-20 rounded-full overflow-hidden bg-gray-100">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
              ) : user.profile_photo_url ? (
                <img src={user.profile_photo_url} alt="Foto de Perfil" className="h-full w-full object-cover" />
              ) : (
                // Placeholder padrão
                <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </span>

            {/* --- 4. CORREÇÃO DO BOTÃO 'CHANGE PHOTO' --- */}
            <SecondaryButton
              type="button" // Garante que não submete o form
              onClick={selectNewPhoto} // Aciona o clique no input escondido
            >
              ALTERAR FOTO
            </SecondaryButton>
            <input
              id="profile_photo"
              type="file"
              className="hidden" // O input fica escondido
              onChange={handlePhotoChange}
              accept="image/*"
              ref={photoInput} // Liga a ref ao input
            />
            {/* --- FIM DA CORREÇÃO --- */}

            {/* Botão de Remover */}
            {user.profile_photo_path && !photoPreview && (
              <SecondaryButton type="button" onClick={removePhoto} className="text-red-600 hover:text-red-500">
                remover foto
              </SecondaryButton>
            )}
          </div>
          <InputError className="mt-2" message={errors.profile_photo} />
        </div>
        {/* --- FIM DO CAMPO DA FOTO --- */}

        <div>
          <InputLabel htmlFor="name" value="Nome" />

          <TextInput
            id="name"
            className="mt-1 block w-full"
            value={data.name}
            onChange={(e) => setData("name", e.target.value)}
            required
            isFocused
            autoComplete="name"
          />

          <InputError className="mt-2" message={errors.name} />
        </div>

        <div>
          <InputLabel htmlFor="email" value="Email" />

          <TextInput
            id="email"
            type="email"
            className="mt-1 block w-full"
            value={data.email}
            onChange={(e) => setData("email", e.target.value)}
            required
            autoComplete="username"
          />

          <InputError className="mt-2" message={errors.email} />
        </div>

        {mustVerifyEmail && user.email_verified_at === null && (
          <div>
            <p className="mt-2 text-sm text-gray-800">
              Seu endereço de email não está verificado.
              <Link
                href={route("verification.send")}
                method="post"
                as="button"
                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Clique aqui para reenviar o email de verificação.
              </Link>
            </p>

            {status === "verification-link-sent" && (
              <div className="mt-2 text-sm font-medium text-green-600">
                Um novo link de verificação foi enviado para o seu endereço de email.
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-4">
          <PrimaryButton disabled={processing}>Salvar</PrimaryButton>

          <Transition
            show={recentlySuccessful}
            enter="transition ease-in-out"
            enterFrom="opacity-0"
            leave="transition ease-in-out"
            leaveTo="opacity-0"
          >
            <Fragment>
              <p className="text-sm text-gray-600">Salvo.</p>
            </Fragment>
          </Transition>
        </div>
      </form>
    </section>
  );
}