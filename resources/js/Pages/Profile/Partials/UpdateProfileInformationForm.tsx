import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from "@/Components/TextInput";
import { Transition } from "@headlessui/react";
import { Link, useForm, usePage } from "@inertiajs/react";
import { FormEventHandler, useState, ChangeEvent, useRef, Fragment } from "react";
import { PageProps } from '@/types';

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
        if (photoInput.current) {
          photoInput.current.value = "";
        }
      },
    });
  };

  const selectNewPhoto = () => {
    photoInput.current?.click();
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setData('profile_photo', file);
    setPhotoPreview(URL.createObjectURL(file));
  };

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
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Informações do perfil
        </h2>

        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Atualize as informações do perfil e o endereço de e-mail da sua conta.
        </p>
      </header>

      <form onSubmit={submit} className="mt-6 space-y-6">

        {/* Foto de perfil */}
        <div>
          <InputLabel htmlFor="profile_photo" value="Foto de perfil" className="dark:text-gray-300" />

          <div className="mt-2 flex items-center space-x-4">
            <span className="h-20 w-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
              ) : user.profile_photo_url ? (
                <img src={user.profile_photo_url} alt="Foto de Perfil" className="h-full w-full object-cover" />
              ) : (
                <svg className="h-full w-full text-gray-300 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </span>

            <SecondaryButton type="button" onClick={selectNewPhoto}>
              ALTERAR FOTO
            </SecondaryButton>

            <input
              id="profile_photo"
              type="file"
              className="hidden"
              onChange={handlePhotoChange}
              accept="image/*"
              ref={photoInput}
            />

            {user.profile_photo_path && !photoPreview && (
              <SecondaryButton type="button" onClick={removePhoto} className="text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300">
                remover foto
              </SecondaryButton>
            )}
          </div>
          <InputError className="mt-2" message={errors.profile_photo} />
        </div>

        <div>
          <InputLabel htmlFor="name" value="Nome" className="dark:text-gray-300" />

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
          <InputLabel htmlFor="email" value="Email" className="dark:text-gray-300" />

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
            <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
              Seu endereço de email não está verificado.
              <Link
                href={route("verification.send")}
                method="post"
                as="button"
                className="rounded-md text-sm text-gray-600 dark:text-gray-400 underline hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Clique aqui para reenviar o email de verificação.
              </Link>
            </p>

            {status === "verification-link-sent" && (
              <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Salvo.</p>
            </Fragment>
          </Transition>
        </div>
      </form>
    </section>
  );
}