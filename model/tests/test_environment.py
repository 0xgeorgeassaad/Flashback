import implicit
import numpy as np
import polars as pl
import scipy


def test_model_dependencies_import() -> None:
    assert implicit.__version__
    assert np.__version__
    assert pl.__version__
    assert scipy.__version__


def test_als_model_can_be_created() -> None:
    model = implicit.als.AlternatingLeastSquares(
        factors=8,
        iterations=1,
        random_state=42,
    )

    assert model.factors == 8
    assert model.iterations == 1
