import type { ConfigExtension } from "cn/config"

export default {
  extend: {
    classGroups: {
      "font-size": [
        {
          text: ["display", "lead"],
        },
      ],
    },
  },
} satisfies ConfigExtension
