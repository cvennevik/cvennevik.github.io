---
title: "Enforcing advanced type constraints with class constructors in TypeScript"
date: 2023-01-20T17:37:00+11:00
---

Frequently, when programming, I am working with data that I expect to follow a set of constraints.

- This parameter must be a string.
- This return value cannot be null.
- This object must have a username property.

Constraints like these are typically common and easy to express in statically typed languages.

Sometimes (actually a lot of times) I am working with data that should follow stricter, more complicated constraints.

- This user-submitted application cannot have the `approvedTime` value set.
- This username must be non-empty and cannot have special characters.
- This `from` value must be before the `to` value.

These constraints can be more tricky to express in a type definition, and I rarely see it attempted. Instead, I see functions either assume the data is valid, or run validation checks on the data that throw an error if it breaks a rule.

Following the advice of _"parse, don't validate"_ (see [the wonderful post by Alexis King](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/)), I would rather that the type itself is able to enforce its own constraints. This guarantees and preserves the validity of the data as you pass it on to other functions, and reduces the risk of insufficient _and_ redundant validation checks around your codebase.

With a few tricks, most constraints you can imagine can be enforced with a type definition. In this case, I'll be showing how to use **classes** to guarantee constraints on TypeScript data that simple `type` and `interface` declarations are unable to. (This technique also works in any statically typed language that supports classes.)

## The technique

1. Define a class containing the values you want to wrap.
2. In the constructor, check for any constraints you are interested in.
3. Throw an error if any of the constructor checks fail.

Key to this technique being widely applicable is that **you are allowed to write class wrappers for single values.** You incur some overhead for having to instantiate each value as a class, and having to access the instance's value to use it, but in return you can enforce any constraint you can imagine in its constructor. Make this tradeoff at your own discretion.

To illustrate the technique, I've spun up a few examples showing what you can do with it.

## A palindrome type

```ts
class Palindrome {
    readonly value: string;

    constructor (value: string) {
        const reversedValue = value.split('').reverse().join('');
        if (value !== reversedValue) {
            throw new Error(`"${value}" is not a palindrome`);
        }

        this.value = value;
    }
}
```

To ensure the string is a palindrome, we reverse it and check if the reversed string is equal to the original string. If not, we throw an error. Then we save the string to the `value` field.

In practice, usage looks like this:

```ts
const palindrome = new Palindrome('())(');
console.log(palindrome); // Output: Palindrome { value: '())(' }
console.log(palindrome.value); // Output: '())('

const invalidPalindrome = new Palindrome('(())');
// Error: "(())" is not a palindrome
```

The `Palindrome` class guarantees that every instance of `Palindrome` contains a string that has passed the constructor validation. If you have any functions that _must_ have a palindrome, the `Palindrome` type is an effective way to enforce it.

If you would rather not throw an error, but check if the string is a palindrome and handle the invalid case another way, you can create a parse method that wraps the palindrome creation in a `try` block, and return `undefined` if it fails:

```ts
class Palindrome {
    // ...

    static parse (value: string): Palindrome | undefined {
        try {
            return new Palindrome(value);
        } catch (error) {
            return error;
        }
    }
}

console.log(Palindrome.parse('())(')); // Output: Palindrome { value: '())(' }
console.log(Palindrome.parse('(())')); // Output: undefined
```

## A sorted array

A constructor does not have to throw errors to ensure a constraint. It can also do the work to transform data to a desired form, then pin it in place.

For instance, you can create a `SortedArray` class that sorts your array for you:

```ts
class SortedArray<T> {
    // Mark as ReadonlyArray to ensure contents stay sorted
    readonly contents: ReadonlyArray<T>;

    constructor (contents: T[]) {
        // Copy the array so we do not reorder the original array,
        // and prevent changes to the original array from affecting our sorted array
        const copy = [...contents];
        copy.sort();
        this.contents = copy;
    }
}

const sortedArray = new SortedArray([0, 5, 3, 4, 4, 2]);
console.log(sortedArray.contents); // Output: [ 0, 2, 3, 4, 4, 5 ]
```

This may be useful if you are working with algorithms that expect a sorted array, like search.

## A range with an estimate

Classes can, of course, also enforce constraints for multiple values. While I was experimenting with a game-playing traditional AI, my search algorithm used an `EstimateRange` data type to describe the minimum, estimate, and maximum value of a given game state. To make sense, the minimum cannot be greater than the maximum, and the estimate must be between them.

Here is how this can be enforced in TypeScript:

```ts
class EstimateRange {
    readonly minimum: number;
    readonly estimate: number;
    readonly maximum: number;

    constructor (minimum: number, estimate: number, maximum: number) {
        if (minimum > maximum) {
            throw new Error(`Minimum (${minimum}) is greater than maximum (${maximum})`);
        } else if (estimate > maximum) {
            throw new Error(`Estimate (${estimate}) is greater than maximum (${maximum})`);
        } else if (estimate < minimum) {
            throw new Error(`Estimate (${estimate}) is less than minimum (${minimum})`);
        }

        this.minimum = minimum;
        this.estimate = estimate;
        this.maximum = maximum;
    }
}

console.log(new EstimateRange(0, 7, 10));
// Output: EstimateRange { minimum: 0, estimate: 7, maximum: 10 }

console.log(new EstimateRange(10, 7, 0));
// Error: Minimum (10) is greater than maximum (0)
```

The point I am trying to make with the variety of examples is that there is a lot you can do with classes. The constraints you can enforce are mostly limited by your imagination.

## A warning

This trick comes with a caveat: **If possible, you are better off enforcing constraints with simpler alternatives.** I prefer using more concise type system features when I can. For TypeScript, you can browse the [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html), [Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html) and [Creating Types from Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html) pages of the TypeScript handbook for inspiration.

When simpler alternatives for type checks are insufficient, class constructor validation is a powerful alternative to fall back on.
