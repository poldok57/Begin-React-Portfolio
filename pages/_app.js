import "../src/styles/globals.css";
import "../src/styles/theme.css";

import { ThemeProvider } from "../src/context/ThemeProvider";
import { TestImageWP } from "../src/components/atom/TestImage";
import { Taskbar } from "../src/components/windows/TaskBar";

const MyApp = ({ Component, pageProps }) => {
  // console.log("redendering MyApp..");
  return (
    <ThemeProvider>
      <div id="app">
        <div className="px-4 m-auto max-w-7xl h-full">
          <Component {...pageProps} />
        </div>

        <TestImageWP
          className="absolute rounded-md border-double border-primary"
          close={true}
          resizable={true}
          style={{
            left: "50px",
            top: "75px",
            width: "120px",
            height: "120px",
          }}
          // image_width="120px"
        />
      </div>
      <Taskbar />
    </ThemeProvider>
  );
};

export default MyApp;
