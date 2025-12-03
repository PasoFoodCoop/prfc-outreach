import { Suspense } from "react";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { ReferralForm } from "@/components/referral/referral-form";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col justify-between items-center text-prfc-dark-brown overflow-x-hidden w-auto mx-auto min-h-screen">
      <Header />

      <section className="flex flex-wrap w-full bg-prfc-tan px-8 md:pr-0 m-0 gap-0">
        <div className="py-8 px-4 flex-[1_1_400px] min-w-[300px] flex flex-col justify-center min-h-full">
          <div className="mb-8">
            <h1 className="font-komika text-prfc-red mb-2 text-[clamp(0.8rem,4vw,2.5rem)]">
              Invite Others to Join the Co-Op!
            </h1>
            <h2 className="font-komika text-prfc-brown text-[clamp(0.8rem,3.8vw,2.5rem)]">
              Refer a Family Member or Friend
            </h2>
          </div>
          <Suspense
            fallback={
              <div role="status" aria-live="polite">
                Loading...
              </div>
            }
          >
            <ReferralForm />
          </Suspense>
        </div>
        <div className="relative flex-[1_1_300px] w-full h-auto min-h-[400px] max-w-[900px] max-md:hidden">
          <Image src="/assets/produce.jpg" alt="Fresh produce display" fill className="object-cover md:pl-24" />
        </div>
      </section>

      <section className="flex-1 flex flex-wrap items-stretch w-full">
        <div className="hidden md:flex flex-[2_1_470px] flex-col justify-center">
          <div className="relative w-full h-full">
            <Image src="/assets/produce_2.jpg" alt="Variety of fresh produce" fill className="object-cover" />
          </div>
        </div>
        <div className="flex-[1_1_300px] bg-prfc-red text-white p-8 font-montserrat flex flex-col justify-center">
          <h2 className="text-[1.8rem] font-komika max-md:text-[1.4rem] max-md:mb-[0.8rem] max-md:mt-6 max-md:first:mt-0">
            Why Should I Refer?
          </h2>
          <p className="max-md:text-[0.9rem] max-md:mb-4 max-md:mt-0">
            Each new member brings fresh ideas, helps us offer more events, and keeps our shelves stocked with an even
            wider variety of products.
          </p>
          <h2 className="text-[1.8rem] font-komika max-md:text-[1.4rem] max-md:mb-[0.8rem] max-md:mt-6">Prizes</h2>
          <p className="max-md:text-[0.9rem] max-md:mb-0 max-md:mt-0">
            For each new member you bring in, you'll earn points to redeem special prizes. Past prizes have included
            bottles of wine, engraved bricks, and more.
          </p>
        </div>
      </section>
    </main>
  );
}
