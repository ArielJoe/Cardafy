import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faq = [
  ["What types of payments are available?", "We only accept ada payment."],
  ["Can I track my shipping progress?", "No, you can't."],
  ["Do I need to pay shipment fee?", "Yes, you do."],
];

export default function AccordionSection() {
  return (
    <div className="flex justify-center mb-12">
      <div className="w-[75%] sm:w-[50%]">
        <div className="mb-2">
          <h1 className="text-3xl font-bold">FAQ</h1>
        </div>
        <Accordion type="single" collapsible>
          {faq.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{item[0]}</AccordionTrigger>
              <AccordionContent>{item[1]}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
