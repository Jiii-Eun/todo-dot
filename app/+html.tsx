import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#8B5CF6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Todo Dot" />
        <link rel="apple-touch-icon" href="/assets/icon.png" />
        <ScrollViewStyleReset />
        <style>{`
          html, body, #root {
            height: 100%;
            width: 100%;
          }
          body {
            margin: 0;
            overflow: hidden;
            background-color: #F8FAFC;
          }
          #root {
            display: flex;
            flex: 1;
          }
          * {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          *::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
