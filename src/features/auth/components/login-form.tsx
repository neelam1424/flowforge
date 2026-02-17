// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { toast } from "sonner";
// import { z } from "zod";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import {authClient} from "@/lib/auth-client"



// const loginSchema = z.object({
//   email: z.email("Please enter a valid email address"),
//   password: z.string().min(1, "Password is required"),
// });

// type LoginFormValues = z.infer<typeof loginSchema>;

// export function LoginForm() {
//   const router = useRouter();

//   const form = useForm<LoginFormValues>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//   });

//   const onSubmit = async (values: LoginFormValues) => {
//     await authClient.signIn.email(
//       {
//         email: values.email,
//         password: values.password,
//         callbackURL: "/",
//       },
//       {
//         onSuccess: () => {
//           router.push("/");
//         },
//         onError: (ctx) => {
//           toast.error(ctx.error.message);
//         },
//       },
//     );

//     // console.log(values)
//   };

//   const isPending = form.formState.isSubmitting;

//   return (
//     <div className="flex flex-col gap-6">
//       <Card>
//         <CardHeader className="text-center">
//           <CardTitle>Welcome Back</CardTitle>
//           <CardDescription>Login to continue</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)}>
//               <div className="grid gap-6">
//                 <div className="flex flex-col gap-4">
//                   <Button
//                     variant="outline"
//                     className="w-full"
//                     type="button"
//                     disabled={isPending}
//                   >
//                     <Image
//                       src="/logos/github.svg"
//                       width={20}
//                       height={20}
//                       alt="github "
//                     />
//                     Continue with Github
//                   </Button>
//                   <Button
//                     variant="outline"
//                     className="w-full"
//                     type="button"
//                     disabled={isPending}
//                   >
//                     <Image
//                       src="/logos/google.svg"
//                       width={20}
//                       height={20}
//                       alt="google "
//                     />
//                     Continue with Google
//                   </Button>
//                 </div>
//                 <div className="grid gap-6">
//                   <FormField
//                     control={form.control}
//                     name="email"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Email</FormLabel>
//                         <FormControl>
//                           <Input
//                             type="email"
//                             placeholder="m@eaxmple.com"
//                             {...field}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="password"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Password</FormLabel>
//                         <FormControl>
//                           <Input
//                             type="password"
//                             placeholder="*********"
//                             {...field}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <Button type="submit" className="w-full" disabled={isPending}>
//                     Login
//                   </Button>
//                 </div>
//                 <div className="text-center text-sm">
//                   Don't have an account?{" "}
//                   <Link href="/signup" className="underline underline-offset-4">
//                     Sign up
//                   </Link>
//                 </div>
//               </div>
//             </form>
//           </Form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }










"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isSocialPending, setIsSocialPending] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle Email Login
  const onSubmit = async (values: LoginFormValues) => {
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        callbackURL: "/", // Redirects to workflows/dashboard
      },
      {
        onSuccess: () => {
          toast.success("Welcome back!");
          router.push("/dashboard");
          router.refresh();
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    );
  };

  // Handle Google/Github Login
  const handleSocialSignIn = async (provider: "google" | "github") => {
    setIsSocialPending(provider);
    await authClient.signIn.social({
      provider,
      callbackURL: "/", // Ensure this matches your workflows page
    }, {
      onSuccess: () => {
        toast.success(`Redirecting to ${provider}...`);
      },
      onError: (ctx) => {
        setIsSocialPending(null);
        toast.error(ctx.error.message);
      }
    });
  };

  const isPending = form.formState.isSubmitting || !!isSocialPending;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Login to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                <div className="flex flex-col gap-4">
                  {/* GitHub Button */}
                  <Button
                    variant="outline"
                    className="w-full"
                    type="button"
                    disabled={isPending}
                    onClick={() => handleSocialSignIn("github")}
                  >
                    <Image
                      src="/logos/github.svg"
                      width={20}
                      height={20}
                      alt="github"
                      className="mr-2"
                    />
                    {isSocialPending === "github" ? "Connecting..." : "Continue with Github"}
                  </Button>

                  {/* Google Button */}
                  <Button
                    variant="outline"
                    className="w-full"
                    type="button"
                    disabled={isPending}
                    onClick={() => handleSocialSignIn("google")}
                  >
                    <Image
                      src="/logos/google.svg"
                      width={20}
                      height={20}
                      alt="google"
                      className="mr-2"
                    />
                    {isSocialPending === "google" ? "Connecting..." : "Continue with Google"}
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="m@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="*********"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isPending}>
                    {form.formState.isSubmitting ? "Logging in..." : "Login"}
                  </Button>
                </div>
                
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}






