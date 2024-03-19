import "../src/styles/globals.css";
import "../src/styles/theme.css";

import { ThemeProvider } from "../src/context/ThemeProvider";
import { TestImageWP } from "../src/components/atom/TestImage";
import {
  ShowAlertMessagesWP,
  MessageProvider,
} from "../src/context/MessageProvider";

const MyApp = ({ Component, pageProps }) => {
  console.log("redendering MyApp..");
  return (
    <ThemeProvider>
      <div id="app">
        <MessageProvider>
          <div className="m-auto h-full max-w-7xl px-4">
            <Component {...pageProps} />
          </div>
          <ShowAlertMessagesWP
            display="true"
            close="false"
            style={{ position: "fixed", right: 50, bottom: 300 }}
            locked="false"
            trace="true"
          />
        </MessageProvider>
        <TestImageWP
          className="absolute rounded-md border-double border-primary"
          locked="false"
          close="true"
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
