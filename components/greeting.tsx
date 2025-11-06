import { motion } from "framer-motion";

export const Greeting = ({ userName }: { userName?: string }) => {
  const firstName = userName ? userName.split(" ")[0] : "there";
  
  return (
    <div
      className="mx-auto mt-8 flex size-full max-w-3xl flex-col justify-start px-4 md:mt-20 md:px-8"
      key="overview"
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="font-semibold text-3xl md:text-4xl mb-2"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.3 }}
      >
        Привет, {firstName}
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl text-muted-foreground md:text-3xl"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.4 }}
      >
        Чем я могу вам помочь?
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-sm text-muted-foreground mt-4"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
      >
        Выберите промпт ниже или напишите свой, чтобы начать общение с Lumina.
      </motion.div>
    </div>
  );
};
