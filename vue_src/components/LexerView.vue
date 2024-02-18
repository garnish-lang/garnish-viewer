<script setup lang="ts">

import {useGarnishStore} from "../stores/garnish";
import {computed} from "vue";
import type {LexerToken} from "../stores/garnish_types";

const store = useGarnishStore();
const activeTokens = computed(() => store.builds[store.activeSource] ? store.builds[store.activeSource].all_lexer_tokens : []);

const sourceTokens = computed(() => Object.entries(store.executionBuild?.source_tokens || {}))
const subSourceTokens = computed(() => {
  const o = {};

  for (let [k, v] of sourceTokens.value) {
    o[k] = [];
  }

  for (let build of store.executionBuild?.context.build_metadata) {
    console.log(build.source);
    o[build.source].push(build);
  }

  console.log(o);
  return o;
})

function makeText(token: LexerToken):string {
  if (token.token_type === "Whitespace" || token.token_type === "Subexpression") {
    let s = [];
    for (let c of token.text) {
      if (c === " ") {
        s.push("⎵");
      } else if (c === "\n") {
        s.push("↵");
      }
    }
    return s.join("");
  } else {
    return token.text;
  }
}

</script>

<template>
  <section v-for="[key, source] in sourceTokens" class="root">
    <h4>Source: {{key}}</h4>
    <section class="tokenList">
      <span v-for="token in source" :title="token.token_type">{{ makeText(token) }}</span>
    </section>
    <section v-for="build in subSourceTokens[key]" class="subTokenList">
      <h6>{{ build.name }}</h6>
      <section class="tokenList">
        <span v-for="token in build.tokens" :title="token.token_type">{{ makeText(token) }}</span>
      </section>
    </section>
  </section>
</template>

<style scoped>
.root {

}

h4, h6 {
  margin: 1rem 0 1rem .5rem;
}

section.tokenList {
  margin: .25rem;
  display: flex;
  flex-grow: 1;
  flex-basis: 0;
  flex-wrap: wrap;
  align-items: flex-start;
  align-content: start;
  justify-content: flex-start;
}

span {
  display: inline-block;
  text-align: center;
  text-wrap: none;
  white-space: nowrap;
  padding: .5rem 1rem;
  margin: 0 .25rem .5rem .25rem;
  flex-basis: 0;
}

span[title="Unknown"] {
  background-color: var(--lexer_token_unknown_color);
}

span[title="Value"],
span[title="Number"],
span[title="UnitLiteral"],
span[title="Value"],
span[title="Identifier"],
span[title="CharList"],
span[title="ByteList"],
span[title="Symbol"],
span[title="False"],
span[title="True"] {
  background-color: var(--lexer_token_value_color);
}

span[title="Whitespace"],
span[title="Subexpression"] {
  background-color: var(--lexer_token_whitespace_color);
  letter-spacing: .5rem;
  padding: .5rem 1rem .5rem 1.5rem;
}

span[title="StartExpression"],
span[title="EndExpression"],
span[title="StartGroup"],
span[title="EndGroup"],
span[title="StartSideEffect"],
span[title="EndSideEffect"] {
  background-color: var(--lexer_token_grouping_color);
}

span[title="PlusSign"],
span[title="Subtraction"],
span[title="Division"],
span[title="MultiplicationSign"],
span[title="ExponentialSign"],
span[title="IntegerDivision"],
span[title="Remainder"],
span[title="AbsoluteValue"],
span[title="Opposite"],
span[title="BitwiseNot"],
span[title="BitwiseAnd"],
span[title="BitwiseOr"],
span[title="BitwiseXor"],
span[title="BitwiseLeftShift"],
span[title="BitwiseRightShift"],
span[title="And"],
span[title="Or"],
span[title="Xor"],
span[title="Not"],
span[title="Comma"],
span[title="Apply"],
span[title="JumpIfFalse"],
span[title="JumpIfTrue"],
span[title="ElseJump"],
span[title="TypeOf"],
span[title="ApplyTo"],
span[title="Reapply"],
span[title="EmptyApply"],
span[title="TypeCast"],
span[title="TypeEqual"],
span[title="Equality"],
span[title="Inequality"],
span[title="LessThan"],
span[title="LessThanOrEqual"],
span[title="GreaterThan"],
span[title="GreaterThanOrEqual"],
span[title="Period"],
span[title="LeftInternal"],
span[title="RightInternal"],
span[title="LengthInternal"],
span[title="Pair"],
span[title="Concatenation"],
span[title="Range"],
span[title="StartExclusiveRange"],
span[title="EndExclusiveRange"],
span[title="ExclusiveRange"],
span[title="PrefixIdentifier"],
span[title="SuffixIdentifier"],
span[title="InfixIdentifier"] {
  background-color: var(--lexer_token_operator_color);
}


span[title="Annotation"],
span[title="LineAnnotation"] {
  background-color: var(--lexer_token_annotation_color);
}
</style>