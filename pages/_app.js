import "../src/styles/globals.css";
import "../src/styles/theme.css";

import { withMousePosition } from "../src/components/windows/withMousePosition";
import { ThemeProvider } from "../src/context/ThemeProvider";
import { TestImageWP } from "../src/components/atom/TestImage";
import { ShowAlertMessages } from "../src/components/alert-messages/ShowAlertMessages";
import { Taskbar } from "../src/components/windows/TaskBar";

export const ShowAlertMessagesWP = withMousePosition(ShowAlertMessages);

const MyApp = ({ Component, pageProps }) => {
  // console.log("redendering MyApp..");
  return (
    <ThemeProvider>
      <div id="app">
        <div className="px-4 m-auto max-w-7xl h-full">
          <Component {...pageProps} />
        </div>
        <ShowAlertMessagesWP
          display={true}
          trace={true}
          draggable={true}
          titleBar={true}
          titleHidden={true}
          withMinimize={true}
          bgTitle="magenta"
          title="Alert Message"
          style={{ position: "fixed", right: 20, bottom: 60 }}
        />
        <TestImageWP
          className="absolute rounded-md border-double border-primary"
          close={true}
          resizeable={true}
          style={{
            left: "50px",
            top: "75px",
          }}
          image_width="120px"
        />
      </div>
      <Taskbar />
    </ThemeProvider>
  );
};

export default MyApp;
