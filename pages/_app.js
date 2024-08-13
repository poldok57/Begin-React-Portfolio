import "../src/styles/globals.css";
import "../src/styles/theme.css";

import { ThemeProvider } from "../src/context/ThemeProvider";
import { Taskbar } from "../src/components/windows/TaskBar";
import { ImageResizable } from "../src/components/windows/ImageResizable";

const MyApp = ({ Component, pageProps }) => {
  // console.log("redendering MyApp..");
  return (
    <ThemeProvider>
      <div id="app">
        <div className="px-4 m-auto max-w-7xl h-full">
          <Component {...pageProps} />
        </div>

        <ImageResizable
          className="rounded-lg shadow-lg"
          close={true}
          resizable={true}
          // trace={true}
          style={{
            position: "absolute",
            left: "50px",
            top: "75px",
          }}
          width={120}
          height={120}
          minWidth={120}
          maxWidth={280}
          keepRatio={true}
          rounded="lg"
          src="/images/card-18-250.jpg"
          // image_width="120px"
        >
          <div className="text-center rounded opacity-20 bg-paper group-hover/testImage:opacity-100">
            absolute image
          </div>
        </ImageResizable>
      </div>
      <Taskbar />
    </ThemeProvider>
  );
};

export default MyApp;
