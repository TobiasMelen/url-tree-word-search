import test from "ava";
import { randomString } from "../index";

test("Random string should have a value", t => t.not(randomString().length, 0));
