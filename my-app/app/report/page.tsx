import { ScrollArea } from "@/components/ui/scroll-area";

const penguinReport = [
  {
    title: "Executive Summary",
    body: "Penguins are flightless marine birds adapted for life in some of the planet's most demanding coastal and ocean environments. This placeholder report summarizes their habitat patterns, feeding behavior, colony dynamics, and conservation pressures in broad, non-scientific terms.",
  },
  {
    title: "Habitat And Movement",
    body: "Most penguin species divide their lives between land-based breeding sites and highly productive ocean feeding grounds. Their compact bodies, dense feathers, and powerful flippers make them efficient swimmers, allowing them to travel long distances in search of fish, krill, and squid.",
  },
  {
    title: "Colony Behavior",
    body: "During breeding season, many penguins gather in large colonies where vocal calls, posture, and location help adults identify mates and chicks. These crowded colonies can look chaotic, but they are organized around repeated paths, nesting territories, and strong parental routines.",
  },
  {
    title: "Diet And Foraging",
    body: "Penguins rely on healthy marine food webs. Changes in sea temperature, prey availability, and ice conditions can affect how far adults must swim to feed. Longer foraging trips may reduce chick survival because parents return less often with food.",
  },
  {
    title: "Conservation Notes",
    body: "The main risks facing penguins include climate change, fisheries competition, pollution, and disturbance around nesting areas. Conservation work often focuses on protecting breeding colonies, reducing bycatch, monitoring food supply, and limiting human pressure in sensitive habitats.",
  },
  {
    title: "Placeholder Recommendation",
    body: "For this application, the report area should eventually show generated code review findings, risk summaries, and suggested next actions. The penguin text is intentionally long enough to validate scrolling, spacing, and readability inside the report panel.",
  },
];

export default function ReportPage() {
  return (
    <div className="flex flex-1 items-center justify-center rounded-xl bg-muted/50 p-6">
      <ScrollArea className="h-[calc(100svh-12rem)] w-full max-w-6xl rounded-md border bg-background">
        <div className="space-y-6 p-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold">Penguin Review Report</h1>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              A placeholder report used to validate the larger scrollable report
              surface.
            </p>
          </div>
          {penguinReport.map((section) => (
            <section key={section.title} className="max-w-4xl space-y-2">
              <h2 className="text-lg font-medium">{section.title}</h2>
              <p className="text-sm leading-7 text-muted-foreground">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
