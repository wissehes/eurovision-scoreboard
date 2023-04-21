import {
  type Icon,
  IconBrandDiscord,
  IconBrandGithub,
  IconBrandGoogle,
  IconBrandInstagram,
  IconBrandTwitter,
} from "@tabler/icons-react";

export const colors: { [key: string]: string } = {
  twitter: "blue",
  github: "gray",
  discord: "indigo",
  instagram: "pink",
  google: "red",
};

export const icons: { [key: string]: Icon } = {
  twitter: IconBrandTwitter,
  github: IconBrandGithub,
  discord: IconBrandDiscord,
  instagram: IconBrandInstagram,
  google: IconBrandGoogle,
};

export const signinErrors: { [key: string]: string } = {
  default: "Unable to sign in.",
  signin: "Try signing in with a different account.",
  oauthsignin: "Try signing in with a different account.",
  oauthcallback: "Try signing in with a different account.",
  oauthcreateaccount: "Try signing in with a different account.",
  emailcreateaccount: "Try signing in with a different account.",
  callback: "Try signing in with a different account.",
  oauthaccountnotlinked:
    "To confirm your identity, sign in with the same account you used originally.",
  emailsignin: "The e-mail could not be sent.",
  credentialssignin:
    "Sign in failed. Check the details you provided are correct.",
  sessionrequired: "Please sign in to access this page.",
};

export interface Provider {
  id: string;
  name: string;
}
