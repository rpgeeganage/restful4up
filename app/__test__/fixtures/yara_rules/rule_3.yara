rule test_rule_3
{
    meta:
        name = "test rule 3"

    strings:
        $my_text_string = "hijklmnopqrstuvwxyz0123456789+/"

    condition:
        all of them
}