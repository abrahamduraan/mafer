"use client";

import { motion } from "framer-motion";
import { PETS } from "@/lib/petsData";
import PetCard from "./pets/PetCard";

// =====================================================================
// PETS SECTION — coro de 14 animalitos kawaii (7 gatitos + 7 perritos) en
// una grilla responsive. Cada uno respira, parpadea y suelta burbujas con
// "Happy birthday" / "I love you" de forma desincronizada. Sin título.
// En lg+ caben los 14 en dos filas de 7.
// =====================================================================

export default function PetsSection() {
  return (
    <section className="relative w-full px-5 py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8 md:grid-cols-4 lg:grid-cols-7 lg:gap-10">
        {PETS.map((pet, i) => (
          <motion.div
            key={pet.id}
            className="relative flex items-end justify-center pt-10"
            initial={{ opacity: 0, y: 24, scale: 0.85 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              delay: (i % 7) * 0.08,
              type: "spring",
              stiffness: 90,
              damping: 14,
            }}
          >
            <PetCard pet={pet} index={i} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
