import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === "ca"
        ? "Política de privacitat"
        : locale === "en"
        ? "Privacy policy"
        : "Política de privacidad",
    robots: { index: false, follow: false },
    alternates: {
      languages: {
        es: "/es/politica-de-privacidad",
        ca: "/ca/politica-de-privacitat",
        en: "/en/privacy-policy",
        "x-default": "/es/politica-de-privacidad",
      },
    },
  };
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const heading =
    locale === "ca"
      ? "Política de privacitat"
      : locale === "en"
      ? "Privacy policy"
      : "Política de privacidad";

  return (
    <>
      <section className="relative bg-[var(--color-dark)] text-white pt-32 pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-[-0.02em]">
            {heading}
          </h1>
          <div className="w-12 h-[2px] bg-[var(--color-primary)] mt-6" />
        </div>
      </section>

      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-6 prose prose-gray">
          {locale === "ca" ? (
            <>
              <h2>Responsable del tractament</h2>
              <p>
                <strong>Patrimonial Obras Barcelona</strong>
                <br />
                C/ de Lepant, 286-288, 08013 Barcelona
                <br />
                Email: gestion@obraspatrimonial.es
              </p>

              <h2>Finalitat del tractament</h2>
              <p>
                Les dades personals que ens proporcioneu a través del formulari
                de contacte seran tractades amb la finalitat de gestionar la
                vostra sol·licitud i posar-nos en contacte amb vosaltres.
              </p>

              <h2>Base legal</h2>
              <p>
                El consentiment de l&apos;interessat en enviar el formulari de
                contacte.
              </p>

              <h2>Destinataris</h2>
              <p>
                Les dades no seran cedides a tercers excepte obligació legal.
              </p>

              <h2>Drets</h2>
              <p>
                Podeu exercir els vostres drets d&apos;accés, rectificació,
                supressió, limitació, portabilitat i oposició enviant un correu
                a gestion@obraspatrimonial.es.
              </p>

              <h2>Conservació</h2>
              <p>
                Les dades es conservaran durant el temps necessari per complir
                amb la finalitat per a la qual es van recollir.
              </p>
            </>
          ) : locale === "en" ? (
            <>
              <h2>Data controller</h2>
              <p>
                <strong>Patrimonial Obras Barcelona</strong>
                <br />
                C/ de Lepant, 286-288, 08013 Barcelona
                <br />
                Email: gestion@obraspatrimonial.es
              </p>

              <h2>Purpose of processing</h2>
              <p>
                The personal data you provide through the contact form will be
                processed for the purpose of handling your enquiry and getting
                in touch with you.
              </p>

              <h2>Legal basis</h2>
              <p>The consent of the data subject when submitting the contact form.</p>

              <h2>Recipients</h2>
              <p>
                Your data will not be shared with third parties except where
                required by law.
              </p>

              <h2>Your rights</h2>
              <p>
                You may exercise your rights of access, rectification, erasure,
                restriction, portability and objection by sending an email to
                gestion@obraspatrimonial.es.
              </p>

              <h2>Data retention</h2>
              <p>
                Your data will be kept for as long as necessary to fulfil the
                purpose for which it was collected.
              </p>
            </>
          ) : (
            <>
              <h2>Responsable del tratamiento</h2>
              <p>
                <strong>Patrimonial Obras Barcelona</strong>
                <br />
                C/ de Lepant, 286-288, 08013 Barcelona
                <br />
                Email: gestion@obraspatrimonial.es
              </p>

              <h2>Finalidad del tratamiento</h2>
              <p>
                Los datos personales que nos proporcione a través del formulario
                de contacto serán tratados con la finalidad de gestionar su
                solicitud y ponernos en contacto con usted.
              </p>

              <h2>Base legal</h2>
              <p>
                El consentimiento del interesado al enviar el formulario de
                contacto.
              </p>

              <h2>Destinatarios</h2>
              <p>
                Los datos no serán cedidos a terceros salvo obligación legal.
              </p>

              <h2>Derechos</h2>
              <p>
                Puede ejercer sus derechos de acceso, rectificación, supresión,
                limitación, portabilidad y oposición enviando un correo a
                gestion@obraspatrimonial.es.
              </p>

              <h2>Conservación</h2>
              <p>
                Los datos se conservarán durante el tiempo necesario para cumplir
                con la finalidad para la que se recogieron.
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
