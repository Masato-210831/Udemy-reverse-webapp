const numbers = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
console.log(numbers);

numbers.forEach((num, i) => {
  const double = num * 2;
  console.log(`${i}: ${double}`);
});

const names = ["Alice", "Bob", "Carol"];
const users = names.map((name, i) => {
  return {
    id: i,
    name: name,
  };
});

console.log(users);

const evenUsers = users.filter((user) => user.id % 2 === 0);
console.log(evenUsers);

const sum = numbers.reduce((prev, curr) => prev + curr, 0)
console.log(sum)