from .models import SentenceHistory
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
import json


def list_instances(request):
    instances = SentenceHistory.objects.all()
    instance_data = []
    for instance in instances:
        translation_preview = ""
        try:
            metadata = json.loads(instance.json_data)
            translation_preview = metadata.get("translation", "")[:500]
        except (TypeError, ValueError, AttributeError):
            translation_preview = "Invalid JSON or no translation available."
        instance_data.append(
            {
                "sentence_id": instance.sentence_id,
                "translation_preview": translation_preview,
                "id": instance.id,
            }
        )

    return render(request, "list_instances.html", {"instances": instance_data})


def edit_instance(request, pk):
    instance = get_object_or_404(SentenceHistory, pk=pk)

    if request.method == "POST":
        raw_json = request.POST.get("data")
        try:
            parsed_json = json.loads(raw_json)
            instance.json_data = json.dumps(parsed_json, sort_keys=True)
            instance.save()
        except json.JSONDecodeError:
            return HttpResponse("Invalid JSON", status=400)

    pretty_json = json.loads(instance.json_data)
    return render(
        request,
        "edit_instance.html",
        {
            "instance": instance,
            "pretty_json": json.dumps(pretty_json, ensure_ascii=False),
        },
    )
