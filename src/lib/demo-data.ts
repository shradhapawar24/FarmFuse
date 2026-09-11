export type DemoProduce = {
  id: string;
  farmerId: string;
  name: string;
  location: string;
  crop: string;
  quantity: number;
  price: number;
  color: string;
};

export const demoProduce: DemoProduce[] = [
  { id: "a", farmerId: "farmer-a", name: "Arjun Patil", location: "Nashik, MH", crop: "Tomato", quantity: 150, price: 22, color: "#e77850" },
  { id: "b", farmerId: "farmer-b", name: "Meera Shinde", location: "Dhule, MH", crop: "Tomato", quantity: 200, price: 23, color: "#e8b84b" },
  { id: "c", farmerId: "farmer-c", name: "Suresh Jadhav", location: "Jalgaon, MH", crop: "Tomato", quantity: 300, price: 21, color: "#77a85d" },
  { id: "d", farmerId: "farmer-d", name: "Kavita More", location: "Nandurbar, MH", crop: "Tomato", quantity: 350, price: 24, color: "#77a7a1" },
];

export function matchProduce(requiredQuantity: number, supply = demoProduce) {
  let remaining = Math.max(requiredQuantity, 0);
  return [...supply]
    .sort((left, right) => left.price - right.price || left.location.localeCompare(right.location) || left.id.localeCompare(right.id))
    .flatMap((farmer) => {
    if (remaining <= 0) return [];
    const contribution = Math.min(remaining, farmer.quantity);
    remaining -= contribution;
    return [{ ...farmer, contribution }];
    });
}
