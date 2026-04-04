const e = (str: string) => encodeURIComponent(encodeURIComponent(str));

export const createOgImage = ({
  title,
  meta,
}: {
  title: string;
  meta: string;
}) =>
  [
    `https://res.cloudinary.com/dcyrcksal/image/upload`,

    // canvas size
    `w_1200,h_630,q_100`,

    // title — large bold Libre Baskerville, dark brown, wraps within 560px wide 220px tall
    `l_text:Libre%20Baskerville_52_bold:${e(title)},co_rgb:4a3f35,c_fit,w_560,h_220`,
    `fl_layer_apply,g_west,x_64,y_-40`,

    // meta — smaller italic Libre Baskerville, muted brown
    `l_text:Libre%20Baskerville_26_italic:${e(meta)},co_rgb:7d6b56,c_fit,w_520`,
    `fl_layer_apply,g_west,x_64,y_120`,

    // base template
    `v1775306289/fewwords-website/fewwords-og-template-single_facz8b`,
  ].join("/");