<script>
  import { Button } from '@graph-paper/button';
  import { DocumentationDark } from '@graph-paper/icons';
</script>

<style>
  .marketing-block {
    padding: var(--space-2x);
    background: linear-gradient(to top, white, transparent), url('bg.jpg');
    background-position: top right -100px;
    background-repeat: no-repeat;
  }

  .marketing-block__inner-container {
    width: var(--space-72x);
  }

  .marketing-block__title {
    margin: 0;
    margin-bottom: var(--space-4x);
    line-height: 1.2;
    font-size: var(--text-08);
  }

  .marketing-block__description {
    margin-bottom: var(--space-4x);
  }

  .marketing-block__call-to-action {
    margin-top: var(--space-2x);
    margin-bottom: var(--space-4x);
  }

  .marketing-block__ask-us {
    font-weight: 200;
    font-style: italic;
  }
</style>

<div class="marketing-block">
  <div class="marketing-block__inner-container">
    <h2 class="marketing-block__title">
      Uncover trends and insights about your product's telemetry probes.
    </h2>
    <div class="marketing-block__description">
      Currently serving: Firefox, Fenix.
    </div>
    <div class="marketing-block__call-to-action">
      <a
        class="button-link"
        target="_blank"
        href="https://docs.google.com/document/d/1qIkEDemnODbYuVIfpciohgEXcaFjrK_mfVG5FOSeVuM/preview">
        <Button>
          <div
            style="display: grid; grid-auto-flow: column; align-items: center; grid-column-gap: var(--space-base);">
            <DocumentationDark size={14} />
            Documentation
          </div>
        </Button>
      </a>
    </div>

    <div class="marketing-block__ask-us">
      Questions? Bugs? Requests? Find us at #GLAM on Slack.
    </div>
  </div>
</div>
