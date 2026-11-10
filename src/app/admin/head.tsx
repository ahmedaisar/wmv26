export default function AdminHead() {
  return (
    <>
      <meta name="page-type" content="software" />
      <meta name="site-kind" content="software" />
      <script
        dangerouslySetInnerHTML={{
          __html: "document.documentElement.dataset.type='software';document.documentElement.dataset.radius='soft';document.documentElement.classList.add('m-enter');setTimeout(()=>document.documentElement.classList.add('m-enter-done'),700);",
        }}
      />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Reddit+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/taste-skill/assets/system.css" />
      <link rel="stylesheet" href="/taste-skill/assets/ui/cards.css" />
      <link rel="stylesheet" href="/taste-skill/assets/motion/motion.css" />
      <link rel="stylesheet" href="/taste-skill/assets/backgrounds/backgrounds.css" />
      <link rel="stylesheet" href="/taste-skill/assets/layout/layout.css" />
      <link rel="stylesheet" href="/taste-skill/assets/icons/icon.css" />
      <link rel="stylesheet" href="/taste-skill/assets/tokens.css" />
    </>
  );
}
