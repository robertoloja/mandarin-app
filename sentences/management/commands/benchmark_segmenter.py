"""
Benchmark the Segmenter against a fixed sentence set.

Measures wall-clock time and DB query count per sentence.
Run before/after a refactor to compare performance.

Usage:
    python manage.py benchmark_segmenter
    python manage.py benchmark_segmenter --runs 5
    python manage.py benchmark_segmenter --sentences-file my_sentences.txt
"""

import time

from django.core.management.base import BaseCommand
from django.db import connection, reset_queries
from django.test.utils import override_settings

# Representative sentences covering different code paths:
# - Short / common words (fast CEDict hits)
# - Long sentence with multi-word compounds
# - Sentence likely to trigger re-split (Jieba hallucination bait)
# - Classical Chinese (likely to need MT fallback for rare chars)
DEFAULT_SENTENCES = [
    "我爱你",
    "今天天气怎么样？",
    "他在图书馆里认真地学习汉语。",
    "我们需要找到一个解决这个问题的办法。",
    "中国的经济发展速度非常快，令世界瞩目。",
    "风萧萧兮易水寒，壮士一去兮不复还。",  # classical — rare vocab
    "她一边听音乐，一边做作业，效率很高。",
    "这家餐厅的红烧肉味道非常好，值得推荐。",
    "信息技术的快速发展改变了人们的生活方式。",
    "他们讨论了很多关于环境保护和可持续发展的问题。",
]


class Command(BaseCommand):
    help = 'Benchmark Segmenter performance: time and DB query count per sentence'

    def add_arguments(self, parser):
        parser.add_argument(
            '--runs',
            type=int,
            default=3,
            help='Number of timed runs per sentence (default: 3)',
        )
        parser.add_argument(
            '--sentences-file',
            type=str,
            default=None,
            help='Path to a text file with one sentence per line',
        )
        parser.add_argument(
            '--no-mt',
            action='store_true',
            help='Skip sentences that would trigger MT (avoids DeepL charges)',
        )

    def handle(self, *args, **options):
        from sentences.segmenters.Segmenter import Segmenter

        sentences = DEFAULT_SENTENCES
        if options['sentences_file']:
            with open(options['sentences_file'], encoding='utf-8') as fh:
                sentences = [line.strip() for line in fh if line.strip()]

        runs = options['runs']

        self.stdout.write(f"\nBenchmarking {len(sentences)} sentences × {runs} run(s)\n")
        self.stdout.write("=" * 72)

        totals = {"time_ms": 0.0, "queries": 0, "sentences": 0}

        import inspect
        new_api = 'original_sentence' in inspect.signature(
            Segmenter.add_definitions_and_create_dictionary
        ).parameters

        with override_settings(DEBUG=True):
            for sentence in sentences:
                times = []
                query_counts = []

                for _ in range(runs):
                    reset_queries()
                    items = _cheap_segment(sentence)
                    t0 = time.perf_counter()
                    if new_api:
                        Segmenter.add_definitions_and_create_dictionary(
                            items, original_sentence=sentence
                        )
                    else:
                        Segmenter.add_definitions_and_create_dictionary(items)
                    elapsed_ms = (time.perf_counter() - t0) * 1000
                    times.append(elapsed_ms)
                    query_counts.append(len(connection.queries))

                avg_ms = sum(times) / len(times)
                avg_q = sum(query_counts) / len(query_counts)
                totals["time_ms"] += avg_ms
                totals["queries"] += avg_q
                totals["sentences"] += 1

                display = sentence if len(sentence) <= 30 else sentence[:28] + "…"
                self.stdout.write(
                    f"  {display:<32}  {avg_ms:7.1f} ms  {avg_q:5.1f} queries"
                )

        self.stdout.write("=" * 72)
        n = totals["sentences"]
        self.stdout.write(
            f"  {'AVERAGE':<32}  {totals['time_ms']/n:7.1f} ms  {totals['queries']/n:5.1f} queries"
        )
        self.stdout.write(
            f"  {'TOTAL':<32}  {totals['time_ms']:7.1f} ms  {totals['queries']:5.0f} queries\n"
        )


def _cheap_segment(sentence: str):
    """Segment without timing the JiebaSegmenter warm-up cost."""
    from sentences.segmenters import DefaultSegmenter
    from sentences.segmenters.Segmenter import Segmenter
    tokens = DefaultSegmenter.segment(sentence)
    return Segmenter.add_pronunciations(tokens)
