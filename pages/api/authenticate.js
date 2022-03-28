// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { clientId, clientSecret } from "../../config";
import axios from "axios";

const tokens = new Map();

export default async function handler(req, res) {
  return res.status(200).end('Nothing to see here. Move along');
  const keyCount = Object.keys(req.query).length;
  if (keyCount < 1 || !req.query.state) {
    return res.status(502).json({
      error: 'invalid_request',
    });
  }

  if (req.query.code && req.query.state) {
    console.log("yeeeees")
    const token = await requestToken(req.query.code, req.query.state);
    tokens.set(String(req.query.state), Buffer.from(token));

    return res.status(200).end('Done. You can close this window now!');
  }

  if (req.query.state) {
    const ID = req.query.state;

    if (tokens.has(ID)) {
      res.status(200).json({
        token: tokens.get(ID).toString(),
      });

      // Securily wipe token from RAM
      tokens.get(ID).fill(0);
      tokens.delete(ID);

      return;
    }

    return res.status(403).json({
      error: 'state_not_defined',
    });
  }

  return res.status(502).json({
    error: 'invalid_request',
  });
}

const requestToken = async (code, state) => {
  console.log("CODE: ", code, "STATE: ", state)
  if (!code || !state) {
    return false;
  }
  try {
    console.log("were posting to git access token")
    const payload = {
          code,
          state,
          client_id: clientId,
          client_secret: clientSecret
    }
    const res = await axios.post('https://github.com/login/oauth/access_token', payload, {headers: {'Content-Type': 'application/json'}})
    const data = await res.data
    return data
  } catch (error) {
    console.error(error);
    return false;
  }
};