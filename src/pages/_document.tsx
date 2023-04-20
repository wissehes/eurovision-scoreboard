import { createGetInitialProps } from "@mantine/next";
import Document, {
  type DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from "next/document";
import { resetServerContext } from "react-beautiful-dnd";

const getInitialProps = createGetInitialProps();

export default class _Document extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const initialProps = await getInitialProps(ctx);
    resetServerContext();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
