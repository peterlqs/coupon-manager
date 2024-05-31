import * as React from "react";

interface EmailTemplateProps {
  message: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  message,
}) => (
  <div>
    <p>{message}</p>
    <hr />
    <p>Made with 🍚 by Quan Ng</p>
  </div>
);
