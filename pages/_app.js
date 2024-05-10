import "../src/styles/globals.css";
import "../src/styles/theme.css";

import { withMousePosition } from "../src/hooks/withMousePosition";
import { ThemeProvider } from "../src/context/ThemeProvider";
import { TestImageWP } from "../src/components/atom/TestImage";
import { ShowAlertMessages } from "../src/hooks/ShowAlertMessages";
// import {
//   ShowAlertMessages,
//   MessageProvider,
// } from "../src/context/MessageProvider";

export const ShowAlertMessagesWP = withMousePosition(ShowAlertMessages);

const MyApp = ({ Component, pageProps }) => {
  // console.log("redendering MyApp..");
  return (
    <ThemeProvider>
      <div id="app">
        <div className="m-auto h-full max-w-7xl px-4">
          <Component {...pageProps} />
        </div>
        <ShowAlertMessagesWP
          trace="false"
          display="true"
          close="false"
          style={{ position: "fixed", right: 20, bottom: 60 }}
          locked="false"
        />
        <TestImageWP
          className="absolute rounded-md border-double border-primary"
          locked="false"
          close="true"
          trace={false}
          resizeable="true"
          style={{
            left: "50px",
            top: "75px",
          }}
          image_width="120px"
        />
      </div>
    </ThemeProvider>
  );
};

export default MyApp;
