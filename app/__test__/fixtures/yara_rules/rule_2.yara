rule test_rule_2
{
    meta:
        name = "test rule 2"

    strings:
        $my_text_string = "SOME FAKE STRING"

    condition:
        all of them
}