import Head from "next/head";
import { useSession } from "next-auth/react";
import { Box, Flex, Heading, Spinner, useToast } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import {
  getSettings,
  SettingsProps,
  SettingsSchema,
  updateSettings,
} from "@/modules/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { Session } from "next-auth";
import AdminNavbar from "@/components/admin-links/navbar";
import Input from "@/components/ui/forms/input";
import Button from "@/components/ui/button";
import { useMutation } from "react-query";
import { useDebouncedCallback } from "use-debounce";
import { checkAvailability } from "@/modules/auth/api";
import axios from "@/lib/axios";
import { reloadSession } from "@/lib/util";

export default function Settings() {
  const { data: session, status } = useSession();

  return (
    <>
      <Head>
        <title>Settings</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box
        backgroundColor="gray.100"
        minW="100vw"
        minH="100vh"
        py="8"
        overflowX="clip"
      >
        <Flex w="95%" mx="auto" direction="column" alignItems="center">
          <AdminNavbar />
          {status === "loading" ? (
            <Spinner size="lg" mt="16" />
          ) : (
            <Flex
              minW="full"
              direction="column"
              alignItems="center"
              my="12"
              gap="8"
            >
              <Heading as="h1" size="lg">
                Settings
              </Heading>
              <SettingsForm session={session as Session} />
            </Flex>
          )}
        </Flex>
      </Box>
    </>
  );
}

function SettingsForm({ session }: { session: Session }) {
  const toast = useToast();
  const { mutate, isLoading } = useMutation(updateSettings, {
    onSuccess: (res) => {
      toast({
        title: "Settings successfully updated.",
        status: "success",
        isClosable: true,
      });
      axios
        .get("/auth/session", { params: { update: true, username: res.data.username } })
        .then(reloadSession);
    },
    onError: (error) => {
      toast({
        title: (error as any).response.data.message,
        status: "error",
        isClosable: true,
      });
    },
  });
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm<SettingsProps>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: async () => getSettings(session!.user.username),
  });

  const onUsernameChange = useDebouncedCallback(async (username: string) => {
    const isCurrentUsername = username === session.user.username;
    const { data } = await checkAvailability("username", username);
    if (!isCurrentUsername && !data.ok) {
      data.errors.forEach((value) =>
        setError(value.field as "username", {
          type: "custom",
          message: value.message,
        })
      );
    } else {
      clearErrors("username");
    }
  }, 1000);

  const onSubmit = handleSubmit((data) => {
    mutate(data);
  });

  return (
    <form onSubmit={onSubmit} style={{ width: "95%", maxWidth: "450px" }}>
      <Flex
        w="full"
        backgroundColor="whiteAlpha.900"
        p="6"
        gap="4"
        rounded="2xl"
        border="1px"
        borderColor="gray.300"
        direction="column"
      >
        <Input
          register={register}
          name="username"
          label="Username"
          placeholder="yourname"
          error={errors.username as any}
          size="sm"
          variant="outline"
          leftAddon="link.hub/"
          onChange={(e) => {
            if (e.target.value) onUsernameChange(e.target.value);
          }}
          required
        />
        <Input
          register={register}
          name="name"
          label="Name (optional)"
          placeholder="Your Name"
          error={errors.name}
          size="sm"
        />
        <Button
          type="submit"
          mt="2"
          isDisabled={!isDirty || isLoading}
          isLoading={isLoading}
        >
          Update
        </Button>
      </Flex>
    </form>
  );
}
