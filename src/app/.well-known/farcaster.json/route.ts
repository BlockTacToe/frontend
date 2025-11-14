declare const process: {
  env: {
    [key: string]: string | undefined;
  };
};

function withValidProperties(properties: Record<string, undefined | string | string[] | boolean>) {
  return Object.fromEntries(
    Object.entries(properties).filter(([_, value]) => {
      if (typeof value === 'boolean') return true;
      return Array.isArray(value) ? value.length > 0 : !!value;
    })
  );
}

export async function GET() {
  const URL = "https://blocxtactoe.vercel.app";
  return Response.json({
    accountAssociation: {
      header: process.env.FARCASTER_HEADER,
      payload: process.env.FARCASTER_PAYLOAD,
      signature: process.env.FARCASTER_SIGNATURE,
    },
    frame: withValidProperties({
      version: '1',
      name: 'BlOcXTacToe',
      subtitle: 'Decentralized Tic Tac Toe',
      description: 'Play Tic Tac Toe - Create games, join matches, and compete on the leaderboard',
      screenshotUrls: [],
      iconUrl: 'https://blocxtactoe.vercel.app/og.png',
      splashImageUrl: 'https://blocxtactoe.vercel.app/logo-og.png',
      splashBackgroundColor: '#383838',
      homeUrl: URL,
      webhookUrl: `${URL}/api/webhook`,
      buttonTitle: 'Play fair. Win crypto.',
      primaryCategory: 'games',
      tags: ['games', 'tictactoe', 'blockchain', 'web3'],
      heroImageUrl: 'https://blocxtactoe.vercel.app/og.png',
      tagline: 'Decentralized Tic Tac Toe',
      ogTitle: 'BlOcXTacToe',
      ogDescription: 'Decentralized Tic Tac Toe',
      ogImageUrl: 'https://blocxtactoe.vercel.app/og.png',
      // use only while testing
      noindex: true,
    }),
    baseBuilder: {
      allowedAddresses: [
        '0x9A780EEbde134AA7c58A0b86C2Ce7A3dC66b5F5b',
      ],
    },  
  });
}
