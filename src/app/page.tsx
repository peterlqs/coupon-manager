/**
 * v0 by Vercel.
 * @see https://v0.dev/t/PmwTvNfrVgf
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <BackgroundBeams className="-z-20" />

      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="#">
          <MountainIcon className="h-6 w-6" />
          <span className="sr-only">Acme Inc</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          {/* <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#features"
          >
            Features
          </Link> */}
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="/sign-in"
          >
            Sign In
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        {/* <section
          id="hero"
          className="w-full py-6 sm:py-12 md:py-24 lg:py-32 xl:py-48"
        >
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="bg-neutral-100 dark:bg-neutral-800 mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square" />
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    The complete platform <br />
                    for building the Web
                  </h1>
                  <p className="max-w-[600px] text-neutral-500 md:text-xl dark:text-neutral-400">
                    Give your team the toolkit to stop configuring and start
                    innovating. Securely build, deploy, and scale the best web
                    experiences.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    className="inline-flex h-10 items-center justify-center rounded-md bg-neutral-900 px-8 text-sm font-medium text-neutral-50 shadow transition-colors hover:bg-neutral-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-50/90 dark:focus-visible:ring-neutral-300"
                    href="#"
                  >
                    Get Started
                  </Link>
                  <Link
                    className="inline-flex h-10 items-center justify-center rounded-md border border-neutral-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 dark:focus-visible:ring-neutral-300"
                    href="#"
                  >
                    Contact Sales
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section> */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div>
                <div className="inline-block rounded-lg bg-neutral-100 px-3 py-1 text-sm dark:bg-neutral-800 mb-2">
                  Completely free... for now
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight mb-2">
                  Coupon Manager.
                </h2>
                <p className="max-w-[900px] text-neutral-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-neutral-400 mb-4">
                  Save money and never let your coupon goes expired again.
                </p>
                <Link
                  className="text-sm font-medium hover:underline underline-offset-4"
                  href="/sign-in"
                >
                  <Button>Get Started</Button>
                </Link>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12  lg:gap-10">
              {/* <div className="mx-auto aspect-video overflow-hidden bg-neutral-100 dark:bg-neutral-800 rounded-xl object-cover object-center sm:w-full lg:order-last" /> */}
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Groups</h3>
                      <p className="text-neutral-500 dark:text-neutral-400">
                        Notify all users in a group when a coupon is about to
                        expire.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Email Notification</h3>
                      <p className="text-neutral-500 dark:text-neutral-400">
                        Email notification will be before a coupon expires.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Scanner</h3>
                      <p className="text-neutral-500 dark:text-neutral-400">
                        Fast and easy to use scanner to add coupon to the app.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          © 2024 Acme Inc. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}

function MountainIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}
