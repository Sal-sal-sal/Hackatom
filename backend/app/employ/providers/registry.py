from app.core.enums import CandidateSource
from .base import CandidateProvider
from .hh import HHProvider

_hh = HHProvider()

PROVIDERS: dict[CandidateSource, CandidateProvider] = {
    CandidateSource.HH: _hh,
    CandidateSource.LINKEDIN: _hh,  # temporary: LinkedIn routed to HH until real adapter exists
}


def get_provider(source: CandidateSource) -> CandidateProvider | None:
    return PROVIDERS.get(source)
