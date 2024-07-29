import ky from "ky";

export const api = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_BASEURL,
  hooks: {
    beforeRequest: [
      request => {
        request.headers.set('Origin', process.env.NEXT_PUBLIC_HOSTNAME || "http://localhost:3000");
      }
    ]
  }
});
