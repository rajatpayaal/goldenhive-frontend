import HomeContent from "../HomeContent";

export default async function SectionPage({ params }) {
  const { slug } = await params;
  return <HomeContent initialSection={slug} />;
}
