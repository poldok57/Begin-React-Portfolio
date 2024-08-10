import Head from "next/head";
import { CommentSection } from "../src/components/comment";
import { DrawSection } from "../src/components/draw";
import { Footer } from "../src/components/Footer";
import { Header } from "../src/components/Header";
import { HeroSection } from "../src/components/hero";
import { ProjectSection } from "../src/components/project";
import { GameSelector } from "../src/components/Games/GameSelector";
import { ShowAlertMessagesWP } from "../src/components/alert-messages/ShowAlertMessages";

const Home = () => {
  return (
    <>
      <Head>
        <title>Portfolio</title>
      </Head>
      <div className="flex flex-col gap-y-32">
        <Header />
        <HeroSection />
        <ProjectSection />
        <GameSelector />
        <DrawSection />
        <CommentSection />
        <Footer />
      </div>
      <ShowAlertMessagesWP
        display={true}
        trace={false}
        draggable={true}
        withTitleBar={true}
        titleHidden={true}
        withMinimize={true}
        titleBackground="magenta"
        titleText="Alert Message"
        style={{ position: "fixed", right: 20, bottom: 60 }}
      />
    </>
  );
};

export default Home;
