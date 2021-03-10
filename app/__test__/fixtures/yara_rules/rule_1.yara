rule test_rule_1
{
    meta:
        name = "test rule 1"

    strings:
        $my_text_string = "This program cannot be run in DOS mode."

    condition:
        all of them
}