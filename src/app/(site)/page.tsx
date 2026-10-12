import Image from "next/image";
import heroImage from "@/assets/home-hero.png";
import { HeroRipple } from "@/components/home/HeroRipple";
import { QuestionList } from "@/components/questions/QuestionList";

export default function QuestionListPage() {
  return (
    <>
      <section className="relative h-[70svh] max-h-[680px] min-h-[420px] overflow-hidden">
        {/* 窄螢幕裁成直式時，以畫面中的人影為中心 */}
        <Image
          src={heroImage}
          alt=""
          fill
          preload
          placeholder="blur"
          sizes="100vw"
          className="object-cover object-[47%_center] lg:object-[center_35%]"
        />
        <HeroRipple src={heroImage.src} width={heroImage.width} height={heroImage.height} />
        <div aria-hidden className="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-ground/85 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent to-ground" />

        <div className="absolute inset-x-0 top-[12%] px-6 text-center [text-shadow:0_2px_12px_rgb(26_16_13/0.95)]">
          <p className="text-sm font-medium tracking-[0.6em] text-gold-bright">出門前</p>
          <h1 className="mt-3 pl-[0.5em] font-serif text-[34px] font-bold tracking-[0.5em] text-ink md:text-5xl">
            問事清單
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink/85 md:text-lg">
            想到就先寫下來，到了廟裡照著問就好。
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <QuestionList />
      </div>
    </>
  );
}
