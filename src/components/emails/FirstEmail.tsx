import React from "react";
import ReactMarkdown from "react-markdown"; // Install react-markdown: npm install react-markdown

interface EmailTemplateProps {
  message: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  message,
}) => (
  <div>
    <ReactMarkdown>{message}</ReactMarkdown>
    <hr />
    <p>Made with 🍚 by Quan Ng</p>
  </div>
);
